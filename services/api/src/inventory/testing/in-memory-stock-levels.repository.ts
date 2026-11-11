import { StockLevel } from '../domain/entities/stock-level.entity.js';
import type { StockLevelsRepository } from '../domain/stock-levels.repository.port.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';
import type { Location, ReorderLevel } from '../domain/value-objects/stock-values.vo.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';

export const copyLevel = (level: StockLevel): StockLevel =>
  StockLevel.restore({
    variantId: level.variantId,
    onHand: level.onHand,
    reserved: level.reserved,
    location: level.location,
    reorderLevel: level.reorderLevel,
  });

// Fake en memoria del puerto: lo usan las pruebas de aplicación. La prueba de contrato garantiza
// que se comporta igual que la implementación real con Postgres.
export class InMemoryStockLevelsRepository implements StockLevelsRepository {
  constructor(private readonly store: InMemoryStockStore = new InMemoryStockStore()) {}

  async findByVariantId(variantId: VariantId): Promise<StockLevel | null> {
    const found = this.store.levels.get(variantId.value);
    return found ? copyLevel(found) : null;
  }

  async saveSettings(
    variantId: VariantId,
    location: Location | null,
    reorderLevel: ReorderLevel
  ): Promise<StockLevel> {
    const level =
      this.store.levels.get(variantId.value) ?? StockLevel.empty(variantId, reorderLevel);
    level.changeSettings(location, reorderLevel);
    this.store.levels.set(variantId.value, level);
    return copyLevel(level);
  }
}
