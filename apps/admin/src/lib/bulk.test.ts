import { afterEach, describe, expect, it, vi } from 'vitest';
import { deactivateAll, listActiveWithoutStock } from './bulk';
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
