import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  LowStockQuery,
  MovementPage,
  MovementsQuery,
  StockPage,
  StockQuery,
  StockRow,
} from '../../application/dtos/stock.dtos.js';
import type { StockQueryPort } from '../../application/ports/inventory.ports.js';
import type { VariantId } from '../../domain/value-objects/ids.vo.js';

const escapeLike = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

const FROM = `
  FROM product_variants v
  JOIN products p ON p.id = v.product_id
  LEFT JOIN stock_levels s ON s.variant_id = v.id`;

const SELECT_ROWS = `SELECT v.id AS variant_id, v.sku, p.name AS product_name, v.size, v.color, v.active,
  COALESCE(s.on_hand, 0) AS on_hand, COALESCE(s.reserved, 0) AS reserved,
  s.location, COALESCE(s.reorder_level, 0) AS reorder_level`;

const AVAILABLE = 'COALESCE(s.on_hand, 0) - COALESCE(s.reserved, 0)';

interface Raw {
  variant_id: string;
  sku: string;
  product_name: string;
  size: string;
  color: string | null;
  active: boolean;
  on_hand: number;
  reserved: number;
  location: string | null;
  reorder_level: number;
}

const toRow = (raw: Raw): StockRow => ({
  variantId: raw.variant_id,
  sku: raw.sku,
  productName: raw.product_name,
  size: raw.size,
  color: raw.color,
  active: raw.active,
  onHand: raw.on_hand,
  reserved: raw.reserved,
  available: raw.on_hand - raw.reserved,
  location: raw.location,
  reorderLevel: raw.reorder_level,
});

// Modelo de lectura del almacén: une el inventario con los datos del producto mediante SQL.
@Injectable()
export class TypeOrmStockQueries implements StockQueryPort {
  constructor(private readonly dataSource: DataSource) {}

  listStock(query: StockQuery): Promise<StockPage> {
    const soldOut = query.soldOut ? `AND v.active AND ${AVAILABLE} <= 0` : '';
    return this.stock(query, soldOut, 'p.name ASC, v.sku ASC');
  }

  listLowStock(query: LowStockQuery): Promise<StockPage> {
    const low = `AND v.active AND ${AVAILABLE} <= COALESCE(s.reorder_level, 0)`;
    return this.stock(query, low, `${AVAILABLE} ASC, v.sku ASC`);
  }

  async listMovements(variantId: VariantId, query: MovementsQuery): Promise<MovementPage> {
    const where = `variant_id = $1 AND ($2::text IS NULL OR type = $2)
      AND ($3::timestamptz IS NULL OR occurred_at >= $3) AND ($4::timestamptz IS NULL OR occurred_at <= $4)`;
    const params = [variantId.value, query.type ?? null, query.from ?? null, query.to ?? null];
    const [{ total }] = await this.dataSource.query(
      `SELECT count(*)::int AS total FROM stock_movements WHERE ${where}`,
      params
    );
    const rows: Record<string, unknown>[] = await this.dataSource.query(
      `SELECT id, type, delta, reason, operator, occurred_at FROM stock_movements WHERE ${where}
       ORDER BY occurred_at DESC, id DESC LIMIT $5 OFFSET $6`,
      [...params, query.pageSize, (query.page - 1) * query.pageSize]
    );
    const items = rows.map((r) => ({
      id: r.id as string,
      type: r.type as string,
      delta: r.delta as number,
      reason: r.reason as string,
      operator: r.operator as string,
      occurredAt: (r.occurred_at as Date).toISOString(),
    }));
    return { items, total, page: query.page, pageSize: query.pageSize };
  }

  private async stock(query: StockQuery, extra: string, order: string): Promise<StockPage> {
    const like = query.text ? `%${escapeLike(query.text)}%` : null;
    const where = `WHERE ($1::text IS NULL OR p.name ILIKE $1 OR v.sku ILIKE $1) ${extra}`;
    if (query.byProduct) return this.stockByProduct(query, where, like);
    const [{ total }] = await this.dataSource.query(
      `SELECT count(*)::int AS total ${FROM} ${where}`,
      [like]
    );
    const rows: Raw[] = await this.dataSource.query(
      `${SELECT_ROWS} ${FROM} ${where} ORDER BY ${order} LIMIT $2 OFFSET $3`,
      [like, query.pageSize, (query.page - 1) * query.pageSize]
    );
    return { items: rows.map(toRow), total, page: query.page, pageSize: query.pageSize };
  }

  // Pagina por producto: primero los ids de la página y luego TODAS las variantes que cumplen el filtro.
  private async stockByProduct(
    query: StockQuery,
    where: string,
    like: string | null
  ): Promise<StockPage> {
    const matching = `SELECT p.id AS product_id, ${SELECT_ROWS.replace('SELECT ', '')} ${FROM} ${where}`;
    const [{ total }] = await this.dataSource.query(
      `SELECT count(DISTINCT product_id)::int AS total FROM (${matching}) m`,
      [like]
    );
    const ids: { product_id: string }[] = await this.dataSource.query(
      `SELECT product_id FROM (${matching}) m GROUP BY product_id, product_name ORDER BY product_name LIMIT $2 OFFSET $3`,
      [like, query.pageSize, (query.page - 1) * query.pageSize]
    );
    const rows: Raw[] = await this.dataSource.query(
      `SELECT * FROM (${matching}) m WHERE product_id = ANY($2) ORDER BY product_name, sku`,
      [like, ids.map((row) => row.product_id)]
    );
    return { items: rows.map(toRow), total, page: query.page, pageSize: query.pageSize };
  }
}
