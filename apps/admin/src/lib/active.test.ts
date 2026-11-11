import { afterEach, describe, expect, it, vi } from 'vitest';
import { setProductActive, setProductPrice, setVariantActive } from './active';

afterEach(() => vi.unstubAllGlobals());

function stubFetch() {
  const calls: { url: string; method: string; body: unknown }[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, method: init?.method ?? 'GET', body: JSON.parse(String(init?.body ?? 'null')) });
      return new Response('{}', { status: 200 });
    })
  );
  return calls;
}

describe('activar y desactivar', () => {
  it('un producto se habilita y deshabilita con PATCH a su ruta', async () => {
    const calls = stubFetch();

    await setProductActive('p1', false);
    await setProductActive('p1', true);

    expect(calls).toEqual([
      { url: '/api/catalog/products/p1/active', method: 'PATCH', body: { active: false } },
      { url: '/api/catalog/products/p1/active', method: 'PATCH', body: { active: true } },
    ]);
  });

  it('una variante se habilita y deshabilita con PATCH a su ruta', async () => {
    const calls = stubFetch();

    await setVariantActive('v9', false);

    expect(calls).toEqual([{ url: '/api/catalog/variants/v9/active', method: 'PATCH', body: { active: false } }]);
  });
});

describe('precio único', () => {
  it('el precio del modelo se envía con PATCH a su ruta', async () => {
    const calls = stubFetch();

    await setProductPrice('p1', '349.90');

    expect(calls).toEqual([{ url: '/api/catalog/products/p1/price', method: 'PATCH', body: { price: '349.90' } }]);
  });
});
