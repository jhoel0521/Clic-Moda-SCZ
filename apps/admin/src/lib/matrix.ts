import type { StockRow } from './stock';
import type { Product, Variant } from './types';

// Matriz de un modelo: filas = colores, columnas = tallas, celda = variante (si existe).
export type Tone = 'out' | 'low' | 'ok' | 'off';

const bySize = (a: string, b: string): number => a.localeCompare(b, 'es', { numeric: true });
const NO_COLOR = 'Único';

export const colorKey = (variant: Variant): string => variant.color ?? NO_COLOR;

export const sizesOf = (product: Product): string[] =>
  [...new Set(product.variants.map((variant) => variant.size))].sort(bySize);

export const colorsOf = (product: Product): string[] => [...new Set(product.variants.map(colorKey))];

export const cellOf = (product: Product, color: string, size: string): Variant | undefined =>
  product.variants.find((variant) => colorKey(variant) === color && variant.size === size);

// Solo cuentan las variantes activas: lo dado de baja no suma ni se marca como agotado.
export const colorTotal = (product: Product, color: string): number =>
  product.variants
    .filter((variant) => colorKey(variant) === color && variant.active)
    .reduce((sum, variant) => sum + (variant.available ?? 0), 0);

export function toneOf(variant: Variant): Tone {
  const available = variant.available ?? 0;
  if (!variant.active) return 'off';
  if (available <= 0) return 'out';
  return available <= (variant.reorderLevel ?? 0) ? 'low' : 'ok';
}

// Precio único del modelo: el de sus variantes activas (o null si difieren, para avisarlo).
export function uniformPrice(product: Product): string | null {
  const prices = new Set(product.variants.map((variant) => Number(variant.price).toFixed(2)));
  return prices.size === 1 ? [...prices][0]! : null;
}

// Fila de stock que entienden la hoja de movimientos y el historial.
export const toStockRow = (product: Product, variant: Variant): StockRow => ({
  variantId: variant.id,
  sku: variant.sku,
  productName: product.name,
  size: variant.size,
  color: variant.color,
  active: variant.active,
  onHand: variant.available ?? 0,
  reserved: 0,
  available: variant.available ?? 0,
  location: variant.location ?? null,
  reorderLevel: variant.reorderLevel ?? 0,
});
