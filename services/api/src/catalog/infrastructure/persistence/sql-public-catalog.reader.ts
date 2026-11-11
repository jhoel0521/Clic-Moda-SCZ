import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type {
  PublicCatalogReader,
  PublicFilters,
  PublicListFilter,
  PublicSort,
  PublishedProduct,
  PublishedSlug,
  PublishedVariant,
} from '../../domain/public-catalog.reader.port.js';
import { Money } from '../../domain/value-objects/money.vo.js';

// Publicado = producto activo, categoría activa y al menos una variante activa. Una sola definición para
// todas las consultas públicas, así el listado, el detalle, los filtros y el sitemap nunca discrepan.
const PUBLISHED = `p.active AND c.active
  AND EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.active)`;

// Disponible de un producto: suma de (en mano - reservado) de sus variantes activas.
const AVAILABLE = `COALESCE((SELECT SUM(s.on_hand - s.reserved) FROM product_variants v
  JOIN stock_levels s ON s.variant_id = v.id WHERE v.product_id = p.id AND v.active), 0)`;

// Precio del modelo: el menor de sus variantes activas (en la práctica es único).
const PRICE = `(SELECT MIN(v.price_cents) FROM product_variants v WHERE v.product_id = p.id AND v.active)`;

const ORDER: Record<PublicSort, string> = {
  new: 'p.created_at DESC, p.id',
  price_asc: `${PRICE} ASC, p.name, p.id`,
  price_desc: `${PRICE} DESC, p.name, p.id`,
};

const escapeLike = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

interface Where {
  sql: string;
  params: unknown[];
}

// Condiciones de un listado, con parámetros numerados ($1, $2…).
function where(filter: PublicListFilter): Where {
  const params: unknown[] = [];
  const conditions = [PUBLISHED];
  const add = (sql: string, value: unknown): void => {
    params.push(value);
    conditions.push(sql.replace('?', `$${String(params.length)}`));
  };
  if (filter.categorySlug) add('c.slug = ?', filter.categorySlug);
  if (filter.text?.trim()) add('p.name ILIKE ?', `%${escapeLike(filter.text.trim())}%`);
  if (filter.size) {
    add(
      'EXISTS (SELECT 1 FROM product_variants v WHERE v.product_id = p.id AND v.active AND v.size = ?)',
      filter.size
    );
  }
  if (filter.onlyAvailable) conditions.push(`${AVAILABLE} > 0`);
  return { sql: conditions.join(' AND '), params };
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category_name: string;
  category_slug: string;
  price_cents: number;
  created_at: Date;
  updated_at: Date;
}

const PRODUCT_COLUMNS = `p.id, p.slug, p.name, p.description, c.name AS category_name, c.slug AS category_slug,
  ${PRICE} AS price_cents, p.created_at, p.updated_at`;

@Injectable()
export class SqlPublicCatalogReader implements PublicCatalogReader {
  constructor(private readonly dataSource: DataSource) {}

  async list(filter: PublicListFilter): Promise<{ items: PublishedProduct[]; total: number }> {
    const { sql, params } = where(filter);
    const from = `FROM products p JOIN categories c ON c.id = p.category_id WHERE ${sql}`;
    const [count]: { total: string }[] = await this.dataSource.query(
      `SELECT count(*) AS total ${from}`,
      params
    );
    const offset = (filter.page - 1) * filter.pageSize;
    const rows: ProductRow[] = await this.dataSource.query(
      `SELECT ${PRODUCT_COLUMNS} ${from} ORDER BY ${ORDER[filter.sort]} LIMIT ${String(filter.pageSize)} OFFSET ${String(offset)}`,
      params
    );
    return { items: await this.assemble(rows), total: Number(count?.total ?? 0) };
  }

  async findBySlug(slug: string): Promise<PublishedProduct | null> {
    const rows: ProductRow[] = await this.dataSource.query(
      `SELECT ${PRODUCT_COLUMNS} FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ${PUBLISHED} AND p.slug = $1`,
      [slug]
    );
    return (await this.assemble(rows))[0] ?? null;
  }

  async filters(): Promise<PublicFilters> {
    const categories: { name: string; slug: string; count: string }[] = await this.dataSource.query(
      `SELECT c.name, c.slug, count(*) AS count FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ${PUBLISHED} GROUP BY c.id ORDER BY c.name`
    );
    const sizes: { size: string }[] = await this.dataSource.query(
      `SELECT DISTINCT v.size FROM product_variants v JOIN products p ON p.id = v.product_id
         JOIN categories c ON c.id = p.category_id WHERE v.active AND ${PUBLISHED}`
    );
    return {
      categories: categories.map((row) => ({
        name: row.name,
        slug: row.slug,
        count: Number(row.count),
      })),
      sizes: sizes.map((row) => row.size).sort(bySize),
    };
  }

  async slugs(): Promise<PublishedSlug[]> {
    const rows: { slug: string; updated_at: Date }[] = await this.dataSource.query(
      `SELECT p.slug, p.updated_at FROM products p JOIN categories c ON c.id = p.category_id
        WHERE ${PUBLISHED} ORDER BY p.slug`
    );
    return rows.map((row) => ({ slug: row.slug, updatedAt: row.updated_at }));
  }

  // Variantes con su disponible y fotos de TODOS los productos en dos consultas (sin N+1).
  private async assemble(rows: ProductRow[]): Promise<PublishedProduct[]> {
    if (rows.length === 0) return [];
    const ids = rows.map((row) => row.id);
    const variants = await this.variantsOf(ids);
    const photos = await this.photosOf(ids);
    return rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      description: row.description,
      categoryName: row.category_name,
      categorySlug: row.category_slug,
      price: Money.ofCents(Number(row.price_cents)),
      photoIds: photos.get(row.id) ?? [],
      variants: variants.get(row.id) ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  private async variantsOf(ids: string[]): Promise<Map<string, PublishedVariant[]>> {
    const rows: {
      product_id: string;
      sku: string;
      size: string;
      color: string | null;
      available: string;
    }[] = await this.dataSource.query(
      `SELECT v.product_id, v.sku, v.size, v.color, COALESCE(s.on_hand - s.reserved, 0) AS available
           FROM product_variants v LEFT JOIN stock_levels s ON s.variant_id = v.id
          WHERE v.product_id = ANY($1) AND v.active ORDER BY v.created_at, v.sku`,
      [ids]
    );
    return group(
      rows,
      (row) => row.product_id,
      (row) => ({
        sku: row.sku,
        size: row.size,
        color: row.color,
        available: Number(row.available),
      })
    );
  }

  private async photosOf(ids: string[]): Promise<Map<string, string[]>> {
    const rows: { product_id: string; media_id: string }[] = await this.dataSource.query(
      `SELECT product_id, media_id FROM product_photos WHERE product_id = ANY($1) ORDER BY position`,
      [ids]
    );
    return group(
      rows,
      (row) => row.product_id,
      (row) => row.media_id
    );
  }
}

function group<Row, Item>(
  rows: Row[],
  key: (row: Row) => string,
  item: (row: Row) => Item
): Map<string, Item[]> {
  const grouped = new Map<string, Item[]>();
  for (const row of rows) grouped.set(key(row), [...(grouped.get(key(row)) ?? []), item(row)]);
  return grouped;
}

// Tallas numéricas por valor ("9" antes que "10") y las de texto al final por orden alfabético.
const bySize = (a: string, b: string): number => {
  const [na, nb] = [Number(a), Number(b)];
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  if (!Number.isNaN(na)) return -1;
  if (!Number.isNaN(nb)) return 1;
  return a.localeCompare(b);
};
