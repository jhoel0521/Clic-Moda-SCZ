import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import type {
  ProcessedCommand,
  StockCommandProcessingPort,
  StockDecider,
} from '../../application/ports/inventory.ports.js';
import type { StockCommand } from '../../domain/entities/stock-command.entity.js';
import { StockLevel } from '../../domain/entities/stock-level.entity.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import { RETRY_POLICY, type RejectReason } from '../../domain/value-objects/command-values.js';
import { MovementId } from '../../domain/value-objects/ids.vo.js';
import { ReorderLevel } from '../../domain/value-objects/stock-values.vo.js';
import {
  type CommandRow,
  type LevelRow,
  NS_PROCESS,
  rowsOf,
  toCommand,
  toLevel,
} from './inventory.rows.js';

interface Candidate {
  id: string;
  variant_id: string;
}

// El comando más antiguo de cada variante que ya le toque; los posteriores de esa variante esperan.
const CANDIDATES = `
  WITH oldest AS (
    SELECT DISTINCT ON (variant_id) id, variant_id, seq, available_at
    FROM stock_commands WHERE status = 'PENDING' ORDER BY variant_id, seq
  )
  SELECT id, variant_id FROM oldest WHERE available_at <= $1 ORDER BY seq LIMIT 50`;

// Se vuelve a comprobar dentro de la transacción: sigue PENDING, le toca y es el más antiguo de su variante.
const CLAIM = `
  SELECT * FROM stock_commands c
  WHERE c.id = $1 AND c.status = 'PENDING' AND c.available_at <= $2
    AND NOT EXISTS (SELECT 1 FROM stock_commands o
                    WHERE o.variant_id = c.variant_id AND o.status = 'PENDING' AND o.seq < c.seq)`;

@Injectable()
export class TypeOrmStockProcessingAdapter implements StockCommandProcessingPort {
  constructor(private readonly dataSource: DataSource) {}

  async processNext(decide: StockDecider, now: Date): Promise<ProcessedCommand | null> {
    const candidates: Candidate[] = await this.dataSource.query(CANDIDATES, [now]);
    for (const candidate of candidates) {
      const processed = await this.tryProcess(candidate, decide, now);
      if (processed) return processed;
    }
    return null;
  }

  private async tryProcess(candidate: Candidate, decide: StockDecider, now: Date) {
    const attempt = { count: 0 };
    try {
      return await this.dataSource.transaction((manager) =>
        this.inTransaction(manager, candidate, decide, now, attempt)
      );
    } catch (error) {
      if (attempt.count === 0) throw error; // falló antes de contar el intento: no es del comando
      return this.failed(candidate.id, attempt.count, now);
    }
  }

  // Todo o nada: reclamar, contar el intento, decidir, aplicar al stock, movimiento y estado final.
  private async inTransaction(
    manager: EntityManager,
    candidate: Candidate,
    decide: StockDecider,
    now: Date,
    attempt: { count: number }
  ): Promise<ProcessedCommand | null> {
    const lock = await manager.query('SELECT pg_try_advisory_xact_lock($1, hashtext($2)) AS ok', [
      NS_PROCESS,
      candidate.variant_id,
    ]);
    if (!lock[0].ok) return null; // otra instancia procesa esta variante
    const rows: CommandRow[] = await manager.query(CLAIM, [candidate.id, now]);
    if (!rows[0]) return null;
    const command = toCommand(rows[0]);
    attempt.count = await this.countAttempt(command);
    const decision = decide(command, await this.levelOf(manager, command));
    return decision.kind === 'REJECT'
      ? this.reject(manager, command, decision.reason, now)
      : this.apply(manager, command, decision.delta, now);
  }

  // El intento se cuenta en una transacción propia ya confirmada (otra conexión): si el proceso
  // cae a mitad, el contador igual avanza y el máximo de intentos se cumple entre reinicios.
  private async countAttempt(command: StockCommand): Promise<number> {
    const result = await this.dataSource.query(
      'UPDATE stock_commands SET attempts = attempts + 1 WHERE id = $1 RETURNING attempts',
      [command.id.value]
    );
    return rowsOf<{ attempts: number }>(result)[0]?.attempts ?? 0;
  }

  private async levelOf(manager: EntityManager, command: StockCommand): Promise<StockLevel> {
    const rows: LevelRow[] = await manager.query(
      'SELECT * FROM stock_levels WHERE variant_id = $1 FOR UPDATE',
      [command.variantId.value]
    );
    return rows[0] ? toLevel(rows[0]) : StockLevel.empty(command.variantId, ReorderLevel.of(0));
  }

  private async reject(
    manager: EntityManager,
    command: StockCommand,
    reason: RejectReason,
    now: Date
  ): Promise<ProcessedCommand> {
    await manager.query(
      `UPDATE stock_commands SET status = 'REJECTED', reject_reason = $2, resolved_at = $3
       WHERE id = $1 AND status = 'PENDING'`,
      [command.id.value, reason, now]
    );
    command.reject(reason, now);
    return { command, movement: null, outcome: 'REJECTED' };
  }

  private async apply(
    manager: EntityManager,
    command: StockCommand,
    delta: number,
    now: Date
  ): Promise<ProcessedCommand> {
    await this.changeStock(manager, command, delta, now);
    const movement = this.movementFor(command, delta, now);
    await this.writeMovement(manager, movement);
    await manager.query(
      `UPDATE stock_commands SET status = 'APPLIED', movement_id = $2, resolved_at = $3
       WHERE id = $1 AND status = 'PENDING'`,
      [command.id.value, movement.id.value, now]
    );
    command.apply(movement.id, now);
    return { command, movement, outcome: 'APPLIED' };
  }

  private async writeMovement(manager: EntityManager, movement: StockMovement): Promise<void> {
    await manager.query(
      `INSERT INTO stock_movements (id, variant_id, command_id, type, delta, reason, operator, occurred_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        movement.id.value,
        movement.variantId.value,
        movement.commandId.value,
        movement.type,
        movement.delta,
        movement.reason.value,
        movement.operator.value,
        movement.occurredAt,
      ]
    );
  }

  // Actualización condicional: la base nunca deja el stock negativo ni por debajo de lo reservado.
  private async changeStock(
    manager: EntityManager,
    command: StockCommand,
    delta: number,
    now: Date
  ): Promise<void> {
    const id = command.variantId.value;
    await manager.query(
      'INSERT INTO stock_levels (variant_id) VALUES ($1) ON CONFLICT DO NOTHING',
      [id]
    );
    const updated = rowsOf(
      await manager.query(
        `UPDATE stock_levels SET on_hand = on_hand + $2::int, updated_at = $3
       WHERE variant_id = $1 AND on_hand + $2::int >= reserved RETURNING on_hand`,
        [id, delta, now]
      )
    );
    if (updated.length === 0) throw new Error('El cambio rompería una invariante de stock');
  }

  private movementFor(command: StockCommand, delta: number, now: Date): StockMovement {
    return StockMovement.restore({
      id: MovementId.generate(),
      variantId: command.variantId,
      commandId: command.id,
      type: command.type,
      delta,
      reason: command.reason,
      operator: command.operator,
      occurredAt: now,
    });
  }

  // Fallo transitorio: reprograma con espera creciente; al agotar los intentos, REJECTED.
  private async failed(id: string, attempts: number, now: Date): Promise<ProcessedCommand> {
    const exhausted = attempts >= RETRY_POLICY.maxAttempts;
    if (exhausted) {
      await this.dataSource.query(
        `UPDATE stock_commands SET status = 'REJECTED', reject_reason = 'PROCESSING_FAILED', resolved_at = $2
         WHERE id = $1 AND status = 'PENDING'`,
        [id, now]
      );
    } else {
      const retryAt = new Date(now.getTime() + RETRY_POLICY.backoffMs(attempts));
      await this.dataSource.query('UPDATE stock_commands SET available_at = $2 WHERE id = $1', [
        id,
        retryAt,
      ]);
    }
    const rows: CommandRow[] = await this.dataSource.query(
      'SELECT * FROM stock_commands WHERE id = $1',
      [id]
    );
    return {
      command: toCommand(rows[0] as CommandRow),
      movement: null,
      outcome: exhausted ? 'REJECTED' : 'RETRY',
    };
  }
}
