import type { StockQueryPort } from '../application/ports/inventory.ports.js';
import type {
  LowStockQuery,
  MovementPage,
  MovementsQuery,
  StockPage,
  StockQuery,
  StockRow,
} from '../application/dtos/stock.dtos.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';

const page = <T>(all: T[], query: { page: number; pageSize: number }) => ({
  items: all.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
  total: all.length,
  page: query.page,
  pageSize: query.pageSize,
});

const matches = (row: StockRow, text?: string): boolean => {
  if (!text) return true;
  const needle = text.toLowerCase();
  return row.sku.toLowerCase().includes(needle) || row.productName.toLowerCase().includes(needle);
};

// Fake en memoria del modelo de lectura: une el stock con el directorio de variantes del store.
export class InMemoryStockQuery implements StockQueryPort {
  constructor(private readonly store: InMemoryStockStore = new InMemoryStockStore()) {}

  async listStock(query: StockQuery): Promise<StockPage> {
    const rows = this.rows()
      .filter((row) => matches(row, query.text))
      .filter((row) => !query.soldOut || (row.active && row.available <= 0))
      .sort((a, b) => a.productName.localeCompare(b.productName) || a.sku.localeCompare(b.sku));
    return page(rows, query);
  }

  async listLowStock(query: LowStockQuery): Promise<StockPage> {
    const rows = this.rows()
      .filter((row) => row.active && row.available <= row.reorderLevel && matches(row, query.text))
      .sort((a, b) => a.available - b.available || a.sku.localeCompare(b.sku));
    return page(rows, query);
  }

  async listMovements(variantId: VariantId, query: MovementsQuery): Promise<MovementPage> {
    const rows = this.store.movements
      .filter((m) => m.variantId.equals(variantId))
      .filter((m) => !query.type || m.type === query.type)
      .filter((m) => !query.from || m.occurredAt >= query.from)
      .filter((m) => !query.to || m.occurredAt <= query.to)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .map((m) => ({
        id: m.id.value,
        type: m.type,
        delta: m.delta,
        reason: m.reason.value,
        operator: m.operator.value,
        occurredAt: m.occurredAt.toISOString(),
      }));
    return page(rows, query);
  }

  private rows(): StockRow[] {
    return [...this.store.variants.entries()].map(([id, info]) => {
      const level = this.store.levels.get(id);
      const [onHand, reserved] = [level?.onHand ?? 0, level?.reserved ?? 0];
      return {
        variantId: id,
        ...info,
        onHand,
        reserved,
        available: onHand - reserved,
        location: level?.location?.value ?? null,
        reorderLevel: level?.reorderLevel.units ?? 0,
      };
    });
  }
}
