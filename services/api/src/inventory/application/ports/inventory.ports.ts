import type { StockCommand } from '../../domain/entities/stock-command.entity.js';
import type { StockLevel } from '../../domain/entities/stock-level.entity.js';
import type { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import type { StockDecision } from '../../domain/stock-policy.js';
import type { VariantId } from '../../domain/value-objects/ids.vo.js';
import type {
  LowStockQuery,
  MovementPage,
  MovementsQuery,
  StockPage,
  StockQuery,
} from '../dtos/stock.dtos.js';

// ¿La variante existe y está activa? null si no existe. Lo implementa infraestructura con una
// consulta de solo lectura: `inventory` no importa código de `catalog`.
export interface VariantLookupPort {
  lookup(id: VariantId): Promise<{ readonly active: boolean } | null>;
}
export const VARIANT_LOOKUP = Symbol('VariantLookupPort');

// Reloj del servidor: única fuente de la hora (orden de llegada, vencimientos, reintentos).
export interface ClockPort {
  now(): Date;
}
export const CLOCK = Symbol('ClockPort');

export type StockDecider = (command: StockCommand, level: StockLevel) => StockDecision;

export type ProcessOutcome = 'APPLIED' | 'REJECTED' | 'RETRY';

export interface ProcessedCommand {
  readonly command: StockCommand;
  readonly movement: StockMovement | null;
  // RETRY: falló y volverá a intentarse; si agotó los intentos queda REJECTED (PROCESSING_FAILED).
  readonly outcome: ProcessOutcome;
}

// Procesa UN comando pendiente dentro de una sola transacción: reclamar, decidir, aplicar al stock,
// escribir el movimiento y fijar el estado final. Orden: solo el comando más antiguo de cada variante
// puede procesarse, y solo cuando le toca (`availableAt`); uno en espera de reintento bloquea a los
// posteriores de su variante. Devuelve null si no hay nada procesable.
export interface StockCommandProcessingPort {
  processNext(decide: StockDecider, now: Date): Promise<ProcessedCommand | null>;
}
export const STOCK_COMMAND_PROCESSING = Symbol('StockCommandProcessingPort');

// Lecturas del almacén (modelo de lectura: une inventario con los datos del producto).
export interface StockQueryPort {
  listStock(query: StockQuery): Promise<StockPage>;
  listLowStock(query: LowStockQuery): Promise<StockPage>;
  listMovements(variantId: VariantId, query: MovementsQuery): Promise<MovementPage>;
}
export const STOCK_QUERY = Symbol('StockQueryPort');
