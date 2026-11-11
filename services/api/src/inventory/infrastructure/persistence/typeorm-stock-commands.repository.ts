import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import type { StockCommand } from '../../domain/entities/stock-command.entity.js';
import { IdempotencyConflictError } from '../../domain/errors/inventory.errors.js';
import type {
  EnqueueOutcome,
  QueueStats,
  StockCommandsRepository,
} from '../../domain/stock-commands.repository.port.js';
import type { CommandId } from '../../domain/value-objects/ids.vo.js';
import { type CommandRow, NS_ENQUEUE, toCommand } from './inventory.rows.js';

const INSERT = `
  INSERT INTO stock_commands
    (id, variant_id, type, quantity, reason, operator, idempotency_key, request_hash,
     status, attempts, available_at, accepted_at)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'PENDING', 0, $9, $9)
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING *`;

@Injectable()
export class TypeOrmStockCommandsRepository implements StockCommandsRepository {
  constructor(private readonly dataSource: DataSource) {}

  // Orden: el bloqueo por variante (espacio NS_ENQUEUE) hace que `seq` coincida con el orden de
  // confirmación. Idempotencia: ON CONFLICT sobre la clave; si ya existía se compara el contenido.
  enqueue(command: StockCommand): Promise<EnqueueOutcome> {
    return this.dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock($1, hashtext($2))', [
        NS_ENQUEUE,
        command.variantId.value,
      ]);
      const inserted: CommandRow[] = await manager.query(INSERT, this.params(command));
      if (inserted[0]) return { command: toCommand(inserted[0]), created: true };
      return this.existing(manager, command);
    });
  }

  async findById(id: CommandId): Promise<StockCommand | null> {
    const rows: CommandRow[] = await this.dataSource.query(
      'SELECT * FROM stock_commands WHERE id = $1',
      [id.value]
    );
    return rows[0] ? toCommand(rows[0]) : null;
  }

  async queueStats(): Promise<QueueStats> {
    const [row] = await this.dataSource.query(
      `SELECT count(*)::int AS pending, min(accepted_at) AS oldest
       FROM stock_commands WHERE status = 'PENDING'`
    );
    return { pending: row.pending, oldestPendingAt: row.oldest ?? null };
  }

  private async existing(manager: EntityManager, command: StockCommand): Promise<EnqueueOutcome> {
    const rows: CommandRow[] = await manager.query(
      'SELECT * FROM stock_commands WHERE idempotency_key = $1',
      [command.idempotencyKey?.value]
    );
    const original = toCommand(rows[0] as CommandRow);
    if (original.requestHash !== command.requestHash) throw new IdempotencyConflictError();
    return { command: original, created: false };
  }

  private params(command: StockCommand): unknown[] {
    return [
      command.id.value,
      command.variantId.value,
      command.type,
      command.quantity.units,
      command.reason.value,
      command.operator.value,
      command.idempotencyKey?.value ?? null,
      command.requestHash,
      command.acceptedAt,
    ];
  }
}
