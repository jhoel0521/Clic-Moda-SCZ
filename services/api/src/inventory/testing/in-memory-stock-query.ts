import type { StockQueryPort } from '../application/ports/inventory.ports.js';
import type {
  InventorySummary,
  LowStockQuery,
  MovementPage,
  MovementsQuery,
  StockPage,
  StockQuery,
  StockRow,
} from '../application/dtos/stock.dtos.js';
import { SEED_TYPES } from '../domain/movement-type-seed.js';
import type { VariantId } from '../domain/value-objects/ids.vo.js';
import { InMemoryStockStore } from './in-memory-stock-store.js';

// Nombres de los tipos con los que nace el sistema (el fake no administra tipos nuevos).
const SEED_NAMES = new Map(SEED_TYPES.map((seed) => [seed.code, seed.name]));

const page = <T>(all: T[], query: { page: number; pageSize: number }) => ({
  items: all.slice((query.page - 1) * query.pageSize, query.page * query.pageSize),
  total: all.length,
  page: query.page,
  pageSize: query.pageSize,
});

// Pagina por producto: cada página trae todas las variantes de sus productos (los productos ya vienen contiguos).
const pagedByProduct = (rows: StockRow[], query: { page: number; pageSize: number }) => {
  const names = [...new Set(rows.map((row) => row.productName))];
  const chosen = new Set(
    names.slice((query.page - 1) * query.pageSize, query.page * query.pageSize)
  );
  return {
    items: rows.filter((row) => chosen.has(row.productName)),
    total: names.length,
    page: query.page,
    pageSize: query.pageSize,
  };
};

const paged = (rows: StockRow[], query: { page: number; pageSize: number; byProduct?: boolean }) =>
  query.byProduct ? pagedByProduct(rows, query) : page(rows, query);

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
    return paged(rows, query);
  }

  async summary(): Promise<InventorySummary> {
    const rows = this.rows().filter((row) => row.active);
    return {
      models: new Set(rows.map((row) => row.productName)).size,
      units: rows.reduce((total, row) => total + row.available, 0),
      soldOutVariants: rows.filter((row) => row.available <= 0).length,
      lowStockVariants: rows.filter((row) => row.available > 0 && row.available <= row.reorderLevel)
        .length,
    };
  }

  async listLowStock(query: LowStockQuery): Promise<StockPage> {
    const rows = this.rows()
      .filter((row) => row.active && row.available <= row.reorderLevel && matches(row, query.text))
      .sort((a, b) => a.available - b.available || a.sku.localeCompare(b.sku));
    return paged(rows, query);
  }

  async listMovements(variantId: VariantId, query: MovementsQuery): Promise<MovementPage> {
    const rows = this.store.movements
      .filter((m) => m.variantId.equals(variantId))
      .filter((m) => !query.type || m.type === query.type)
      .filter((m) => !query.typeCode || m.typeCode.value === query.typeCode)
      .filter((m) => !query.from || m.occurredAt >= query.from)
      .filter((m) => !query.to || m.occurredAt <= query.to)
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .map((m) => ({
        id: m.id.value,
        type: m.type,
        typeCode: m.typeCode.value,
        typeName: SEED_NAMES.get(m.typeCode.value) ?? m.typeCode.value,
        delta: m.delta,
        balanceAfter: m.balanceAfter,
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
