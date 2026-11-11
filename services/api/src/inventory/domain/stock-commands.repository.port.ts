import type { StockCommand } from './entities/stock-command.entity.js';
import type { CommandId } from './value-objects/ids.vo.js';

export interface EnqueueOutcome {
  // El comando guardado, ya con su número de orden de llegada (`seq`).
  readonly command: StockCommand;
  // false si la clave de idempotencia ya existía y se devolvió el comando original.
  readonly created: boolean;
}

export interface QueueStats {
  readonly pending: number;
  readonly oldestPendingAt: Date | null;
}

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
// Solo cubre el encolado y la consulta: el reclamo y la resolución son del puerto de procesamiento.
export interface StockCommandsRepository {
  // Acepta el comando de forma duradera. Orden: para una misma variante, el número de llegada
  // (`seq`) coincide con el orden de confirmación. Idempotente por `idempotencyKey`: la misma clave
  // con el mismo contenido devuelve el original; con otro contenido lanza IdempotencyConflictError.
  enqueue(command: StockCommand): Promise<EnqueueOutcome>;
  findById(id: CommandId): Promise<StockCommand | null>;
  queueStats(): Promise<QueueStats>;
}

export const STOCK_COMMANDS_REPOSITORY = Symbol('StockCommandsRepository');
