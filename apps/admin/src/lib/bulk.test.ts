import { afterEach, describe, expect, it, vi } from 'vitest';
import { deactivateAll, deactivateVariants, listActiveWithoutStock, listSoldOutVariants } from './bulk';
import type { Product } from './types';

const product = (id: string): Product => ({
  id,
  categoryId: 'c1',
  name: id,
  description: null,
  active: true,
  variants: [],
});

function stubFetch(responses: unknown[]) {
  const calls: { url: string; method: string }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, method: init?.method ?? 'GET' });
      return new Response(JSON.stringify(responses.shift() ?? {}), { status: 200 });
    })
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

const row = (variantId: string) => ({
  variantId,
  sku: variantId,
  productName: 'P',
  size: 'M',
  color: null,
  active: true,
  onHand: 0,
  reserved: 0,
  available: 0,
  location: null,
  reorderLevel: 0,
});

describe('listActiveWithoutStock', () => {
  it('pide solo los activos sin stock y respeta el texto y la categoría', async () => {
    const calls = stubFetch([{ items: [product('a')], total: 1, page: 1, pageSize: 100 }]);

    const found = await listActiveWithoutStock({ text: ' bota ', categoryId: 'cat-1' });

    expect(found.map((p) => p.id)).toEqual(['a']);
    const url = decodeURIComponent(calls[0]!.url);
    for (const part of ['stock=out', 'active=true', 'pageSize=100', 'text=bota', 'categoryId=cat-1']) {
      expect(url).toContain(part);
    }
  });
});

describe('deactivateAll', () => {
  it('desactiva cada producto con PATCH y devuelve cuántos fueron', async () => {
    const calls = stubFetch([{}, {}, {}]);

    const done = await deactivateAll([product('a'), product('b'), product('c')]);

    expect(done).toBe(3);
    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['PATCH', '/api/catalog/products/a/active'],
      ['PATCH', '/api/catalog/products/b/active'],
      ['PATCH', '/api/catalog/products/c/active'],
    ]);
  });

  it('con una lista vacía no llama a nada', async () => {
    const calls = stubFetch([]);

    expect(await deactivateAll([])).toBe(0);
    expect(calls).toEqual([]);
  });
});

describe('variantes agotadas', () => {
  it('lista solo las variantes activas agotadas, con la búsqueda', async () => {
    const calls = stubFetch([{ items: [row('v1')], total: 1, page: 1, pageSize: 100 }]);

    const found = await listSoldOutVariants(' blusa ');

    expect(found.map((r) => r.variantId)).toEqual(['v1']);
    const url = decodeURIComponent(calls[0]!.url);
    for (const part of ['inventory/stock', 'soldOut=true', 'pageSize=100', 'text=blusa']) expect(url).toContain(part);
  });
});

describe('variantes agotadas (2)', () => {
  it('desactiva cada variante en el catálogo con PATCH', async () => {
    const calls = stubFetch([{}, {}]);

    expect(await deactivateVariants([row('v1'), row('v2')])).toBe(2);
    expect(calls.map((c) => [c.method, c.url])).toEqual([
      ['PATCH', '/api/catalog/variants/v1/active'],
      ['PATCH', '/api/catalog/variants/v2/active'],
    ]);
  });
});
