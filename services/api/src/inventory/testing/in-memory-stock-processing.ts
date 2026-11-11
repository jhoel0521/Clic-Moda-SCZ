import type {
  ProcessedCommand,
  StockCommandProcessingPort,
  StockDecider,
} from '../application/ports/inventory.ports.js';
import type { StockCommand } from '../domain/entities/stock-command.entity.js';
import { StockLevel } from '../domain/entities/stock-level.entity.js';
import { StockMovement } from '../domain/entities/stock-movement.entity.js';
import { RETRY_POLICY } from '../domain/value-objects/command-values.js';
import { MovementId } from '../domain/value-objects/ids.vo.js';
import { ReorderLevel } from '../domain/value-objects/stock-values.vo.js';
import { copyCommand } from './in-memory-stock-commands.repository.js';
import { copyLevel } from './in-memory-stock-levels.repository.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';

// Fake en memoria del puerto de procesamiento. Las reglas de orden y de reintento son las mismas que
// la prueba de contrato exige a la implementación con Postgres.
export class InMemoryStockProcessing implements StockCommandProcessingPort {
  constructor(private readonly store: InMemoryStockStore = new InMemoryStockStore()) {}

  async processNext(decide: StockDecider, now: Date): Promise<ProcessedCommand | null> {
    const candidate = this.candidate(now);
    if (!candidate) return null;
    candidate.scheduleRetry(candidate.attempts + 1, candidate.availableAt); // el intento cuenta ya
    try {
      return this.resolve(candidate, decide, now);
    } catch {
      return this.failed(candidate, now);
    }
  }

  // Solo el más antiguo de cada variante es candidato; si no le toca aún, bloquea a los posteriores.
  private candidate(now: Date): StockCommand | null {
    const oldestByVariant = new Map<string, StockCommand>();
    for (const command of [...this.store.commands.values()].sort((a, b) => a.seq! - b.seq!)) {
      if (command.status === 'PENDING' && !oldestByVariant.has(command.variantId.value)) {
        oldestByVariant.set(command.variantId.value, command);
      }
    }
    const ready = [...oldestByVariant.values()].filter((c) => c.availableAt <= now);
    return ready.sort((a, b) => a.seq! - b.seq!)[0] ?? null;
  }

  // Todo o nada: el estado visible solo cambia cuando la decisión y el movimiento ya están listos.
  private resolve(command: StockCommand, decide: StockDecider, now: Date): ProcessedCommand {
    const level = this.levelOf(command);
    const decision = decide(copyCommand(command), copyLevel(level));
    if (decision.kind === 'REJECT') {
      command.reject(decision.reason, now);
      return { command: copyCommand(command), movement: null, outcome: 'REJECTED' };
    }
    level.applyDelta(decision.delta);
    const movement = StockMovement.restore({
      id: MovementId.generate(),
      variantId: command.variantId,
      commandId: command.id,
      type: command.type,
      delta: decision.delta,
      reason: command.reason,
      operator: command.operator,
      occurredAt: now,
    });
    command.apply(movement.id, now);
    this.store.levels.set(command.variantId.value, level);
    this.store.movements.push(movement);
    return { command: copyCommand(command), movement, outcome: 'APPLIED' };
  }

  private failed(command: StockCommand, now: Date): ProcessedCommand {
    if (command.attempts >= RETRY_POLICY.maxAttempts) {
      command.reject('PROCESSING_FAILED', now);
      return { command: copyCommand(command), movement: null, outcome: 'REJECTED' };
    }
    const retryAt = new Date(now.getTime() + RETRY_POLICY.backoffMs(command.attempts));
    command.scheduleRetry(command.attempts, retryAt);
    return { command: copyCommand(command), movement: null, outcome: 'RETRY' };
  }

  private levelOf(command: StockCommand): StockLevel {
    const existing = this.store.levels.get(command.variantId.value);
    return existing ? copyLevel(existing) : StockLevel.empty(command.variantId, ReorderLevel.of(0));
  }
}
