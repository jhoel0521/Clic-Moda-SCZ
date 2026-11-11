import { api } from './client-api';
import type { Product } from './types';

// Un solo estante por modelo: se guarda en cada variante (el stock vive por variante) y se muestra una vez.
export function shelfOf(product: Product): string {
  const counts = new Map<string, number>();
  for (const variant of product.variants) {
    if (variant.location) counts.set(variant.location, (counts.get(variant.location) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

// El umbral de stock bajo no se edita aquí: se conserva el que ya tiene cada variante.
export async function setShelf(product: Product, text: string): Promise<void> {
  const location = text.trim() === '' ? null : text.trim();
  await Promise.all(
    product.variants.map((variant) =>
      api('PATCH', `inventory/stock/${variant.id}/settings`, { location, reorderLevel: variant.reorderLevel ?? 2 })
    )
  );
}
