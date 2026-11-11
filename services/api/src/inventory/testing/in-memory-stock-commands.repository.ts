import { StockCommand } from '../domain/entities/stock-command.entity.js';
import { IdempotencyConflictError } from '../domain/errors/inventory.errors.js';
import type {
  EnqueueOutcome,
  QueueStats,
  StockCommandsRepository,
} from '../domain/stock-commands.repository.port.js';
import type { CommandId } from '../domain/value-objects/ids.vo.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';

export const copyCommand = (command: StockCommand): StockCommand =>
  StockCommand.restore({ ...command.snapshot });

// Fake en memoria del puerto: lo usan las pruebas de aplicación. La prueba de contrato garantiza
// que se comporta igual que la implementación real con Postgres.
export class InMemoryStockCommandsRepository implements StockCommandsRepository {
  constructor(private readonly store: InMemoryStockStore = new InMemoryStockStore()) {}

  async enqueue(command: StockCommand): Promise<EnqueueOutcome> {
    const key = command.idempotencyKey?.value;
    const existing = key && this.all().find((other) => other.idempotencyKey?.value === key);
    if (existing) {
      if (existing.requestHash !== command.requestHash) throw new IdempotencyConflictError();
      return { command: copyCommand(existing), created: false };
    }
    const stored = StockCommand.restore({ ...command.snapshot, seq: this.store.nextSeq() });
    this.store.commands.set(stored.id.value, stored);
    return { command: copyCommand(stored), created: true };
  }

  async findById(id: CommandId): Promise<StockCommand | null> {
    const found = this.store.commands.get(id.value);
    return found ? copyCommand(found) : null;
  }

  async queueStats(): Promise<QueueStats> {
    const pending = this.all().filter((command) => command.status === 'PENDING');
    const oldest = pending.map((command) => command.acceptedAt.getTime()).sort((a, b) => a - b)[0];
    return {
      pending: pending.length,
      oldestPendingAt: oldest === undefined ? null : new Date(oldest),
    };
  }

  private all(): StockCommand[] {
    return [...this.store.commands.values()];
  }
}
