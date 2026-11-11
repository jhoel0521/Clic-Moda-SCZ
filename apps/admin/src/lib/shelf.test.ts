import { afterEach, expect, it, vi } from 'vitest';
import { fakeApi } from '../test/fake-api';
import { setShelf, shelfOf } from './shelf';
import type { Product, Variant } from './types';

afterEach(() => vi.unstubAllGlobals());

const variant = (id: string, location: string | null, reorderLevel = 2): Variant => ({
  id,
  sku: id,
  size: '38',
  color: null,
  price: '100.00',
  active: true,
  location,
  reorderLevel,
});

const model = (variants: Variant[]): Product => ({
  id: 'p1',
  categoryId: 'c1',
  name: 'Bota',
  description: null,
  active: true,
  variants,
});

it('Estante — el del modelo es el más repetido entre sus variantes', () => {
  const product = model([variant('a', 'Estante B6'), variant('b', 'Estante B6'), variant('c', 'Estante C1')]);

  expect(shelfOf(product)).toBe('Estante B6');
});

it('Estante — sin ubicación en ninguna variante queda vacío', () => {
  expect(shelfOf(model([variant('a', null)]))).toBe('');
});

it('Estante — se aplica a todas las variantes conservando su umbral', async () => {
  const calls = fakeApi({
    'PATCH inventory/stock/a/settings': {},
    'PATCH inventory/stock/b/settings': {},
  });

  await setShelf(model([variant('a', null, 3), variant('b', null, 2)]), '  Estante D4 ');

  expect(calls.map((c) => [c.path, c.body])).toEqual([
    ['inventory/stock/a/settings', { location: 'Estante D4', reorderLevel: 3 }],
    ['inventory/stock/b/settings', { location: 'Estante D4', reorderLevel: 2 }],
  ]);
});

it('Estante — un texto vacío quita la ubicación', async () => {
  const calls = fakeApi({ 'PATCH inventory/stock/a/settings': {} });

  await setShelf(model([variant('a', 'Estante B6')]), '   ');

  expect(calls[0]?.body).toEqual({ location: null, reorderLevel: 2 });
});
