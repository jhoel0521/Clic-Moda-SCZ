import { randomUUID } from 'node:crypto';
import type { DataSource } from 'typeorm';
import { StockMovement } from '../../src/inventory/domain/entities/stock-movement.entity.js';
import { parseCommandType } from '../../src/inventory/domain/value-objects/command-values.js';
import {
  CommandId,
  MovementId,
  VariantId,
} from '../../src/inventory/domain/value-objects/ids.vo.js';
import { Operator, Reason } from '../../src/inventory/domain/value-objects/stock-values.vo.js';
import type { VariantInfo } from '../../src/inventory/testing/stock-query.contract.js';

// Devuelve el producto con ese nombre (lo crea con su categoría si no existe): varias variantes del mismo
// nombre pertenecen al MISMO producto, como en el catálogo real.
async function productNamed(db: DataSource, name: string): Promise<string> {
  const found: { id: string }[] = await db.query(
    'SELECT id FROM products WHERE name = $1 LIMIT 1',
    [name]
  );
  if (found[0]) return found[0].id;
  const [categoryId, productId] = [randomUUID(), randomUUID()];
  const label = `cat-${categoryId}`;
  await db.query('INSERT INTO categories (id, name, slug) VALUES ($1, $2, $3)', [
    categoryId,
    label,
    label,
  ]);
  // El slug es obligatorio y único: se deriva del id para no chocar entre productos del mismo nombre.
  await db.query('INSERT INTO products (id, category_id, name, slug) VALUES ($1, $2, $3, $4)', [
    productId,
    categoryId,
    name,
    `prod-${productId}`,
  ]);
  return productId;
}

// Crea una variante real (y su producto si hace falta) con SQL directo y devuelve su id.
export async function insertVariant(db: DataSource, info: VariantInfo): Promise<VariantId> {
  const variantId = randomUUID();
  const productId = await productNamed(db, info.productName);
  await db.query(
    `INSERT INTO product_variants (id, product_id, sku, size, color, price_cents, active)
     VALUES ($1, $2, $3, $4, $5, 10000, $6)`,
    [variantId, productId, info.sku, info.size ?? '38', info.color ?? null, info.active ?? true]
  );
  return VariantId.of(variantId);
}

interface MovementInput {
  type: string;
  delta: number;
  occurredAt: Date;
}

// Un movimiento real exige un comando (clave foránea): se crea uno ya resuelto y su movimiento.
export async function insertCommandRow(
  db: DataSource,
  variantId: VariantId,
  movement: MovementInput
): Promise<void> {
  const [commandId, movementId] = [randomUUID(), randomUUID()];
  await db.query(
    `INSERT INTO stock_commands (id, variant_id, type, quantity, reason, operator, request_hash, status, resolved_at, movement_id)
     VALUES ($1, $2, $3, 1, 'Prueba de contrato', 'u-1', repeat('a', 64), 'APPLIED', $4, NULL)`,
    [commandId, variantId.value, movement.type, movement.occurredAt]
  );
  await db.query(
    `INSERT INTO stock_movements (id, variant_id, command_id, type, delta, reason, operator, occurred_at)
     VALUES ($1, $2, $3, $4, $5, 'Prueba de contrato', 'u-1', $6)`,
    [movementId, variantId.value, commandId, movement.type, movement.delta, movement.occurredAt]
  );
}

export async function readMovements(
  db: DataSource,
  variantId: VariantId
): Promise<StockMovement[]> {
  const rows: Record<string, unknown>[] = await db.query(
    'SELECT * FROM stock_movements WHERE variant_id = $1 ORDER BY occurred_at, id',
    [variantId.value]
  );
  return rows.map((row) =>
    StockMovement.restore({
      id: MovementId.of(row.id as string),
      variantId,
      commandId: CommandId.of(row.command_id as string),
      type: parseCommandType(row.type as string),
      delta: row.delta as number,
      reason: Reason.of(row.reason as string),
      operator: Operator.of(row.operator as string),
      occurredAt: row.occurred_at as Date,
    })
  );
}
