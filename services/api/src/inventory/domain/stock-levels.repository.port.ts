import type { StockLevel } from './entities/stock-level.entity.js';
import type { VariantId } from './value-objects/ids.vo.js';
import type { Location, ReorderLevel } from './value-objects/stock-values.vo.js';

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
// Las unidades solo cambian por el procesamiento de comandos (puerto de procesamiento): este puerto
// lee el nivel y guarda los ajustes que no son contendidos (ubicación y umbral).
export interface StockLevelsRepository {
  // null si la variante todavía no tiene fila de stock (equivale a stock cero).
  findByVariantId(variantId: VariantId): Promise<StockLevel | null>;
  // Crea la fila si no existe (con 0 unidades) o actualiza ubicación y umbral; no toca las unidades.
  saveSettings(
    variantId: VariantId,
    location: Location | null,
    reorderLevel: ReorderLevel
  ): Promise<StockLevel>;
}

export const STOCK_LEVELS_REPOSITORY = Symbol('StockLevelsRepository');
