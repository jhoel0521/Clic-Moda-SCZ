import { api } from './client-api';
import type { StockRow } from './stock';
import type { Page, Product } from './types';

const MAX = 100;

// Productos ACTIVOS sin stock que cumplen el texto y la categoría del listado (hasta 100 por vez).
export async function listActiveWithoutStock(filters: { text?: string; categoryId?: string }): Promise<Product[]> {
  const params = new URLSearchParams({ stock: 'out', active: 'true', page: '1', pageSize: String(MAX) });
  if (filters.text?.trim()) params.set('text', filters.text.trim());
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  const page = await api<Page<Product>>('GET', `catalog/products?${params.toString()}`);
  return page.items;
}

// Desactiva uno por uno (no se borra nada: se pueden reactivar). Devuelve cuántos se desactivaron.
export async function deactivateAll(products: Product[]): Promise<number> {
  let done = 0;
  for (const product of products) {
    await api('PATCH', `catalog/products/${product.id}/active`, { active: false });
    done += 1;
  }
  return done;
}

// Variantes ACTIVAS agotadas (disponible 0 o menos) que cumplen la búsqueda (hasta 100 por vez).
export async function listSoldOutVariants(text?: string): Promise<StockRow[]> {
  const params = new URLSearchParams({ soldOut: 'true', page: '1', pageSize: String(MAX) });
  if (text?.trim()) params.set('text', text.trim());
  const page = await api<Page<StockRow>>('GET', `inventory/stock?${params.toString()}`);
  return page.items;
}

// Desactiva cada variante en el catálogo (no se borra nada). Devuelve cuántas se desactivaron.
export async function deactivateVariants(rows: StockRow[]): Promise<number> {
  let done = 0;
  for (const row of rows) {
    await api('PATCH', `catalog/variants/${row.variantId}/active`, { active: false });
    done += 1;
  }
  return done;
}
