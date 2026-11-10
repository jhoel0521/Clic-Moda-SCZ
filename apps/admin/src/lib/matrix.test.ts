import { describe, expect, it } from 'vitest';
import { cellOf, colorsOf, colorTotal, sizesOf, toneOf, uniformPrice } from './matrix';
import type { Product, Variant } from './types';

const variant = (size: string, color: string | null, available: number, extra: Partial<Variant> = {}): Variant => ({
  id: `${color}-${size}`,
  sku: `S-${size}`,
  size,
  color,
  price: '300.00',
  active: true,
  available,
  reorderLevel: 2,
  ...extra,
});

const boot: Product = {
  id: 'p1',
  categoryId: 'c1',
  name: 'Bota Andes',
  description: null,
  active: true,
  variants: [
    variant('40', 'Negro', 4),
    variant('38', 'Negro', 0),
    variant('38', 'Coñac', 2),
    variant('42', 'Coñac', 9),
  ],
};

describe('matriz de un modelo', () => {
  it('ordena las tallas numéricamente y agrupa los colores', () => {
    expect(sizesOf(boot)).toEqual(['38', '40', '42']);
    expect(colorsOf(boot)).toEqual(['Negro', 'Coñac']);
  });

  it('encuentra la variante de cada celda y deja vacía la que no existe', () => {
    expect(cellOf(boot, 'Coñac', '42')?.available).toBe(9);
    expect(cellOf(boot, 'Negro', '42')).toBeUndefined();
  });
});

describe('stock de la matriz', () => {
  it('suma por color solo las variantes activas', () => {
    const off = { ...boot, variants: [...boot.variants, variant('44', 'Negro', 7, { active: false })] };

    expect(colorTotal(off, 'Negro')).toBe(4);
    expect(colorTotal(off, 'Coñac')).toBe(11);
  });

  it('clasifica el stock: agotado, bajo, normal y dado de baja', () => {
    expect(toneOf(variant('1', null, 0))).toBe('out');
    expect(toneOf(variant('1', null, 2))).toBe('low');
    expect(toneOf(variant('1', null, 3))).toBe('ok');
    expect(toneOf(variant('1', null, 5, { active: false }))).toBe('off');
  });

  it('informa el precio único o null si las variantes difieren', () => {
    expect(uniformPrice(boot)).toBe('300.00');
    expect(
      uniformPrice({ ...boot, variants: [variant('1', null, 1), variant('2', null, 1, { price: '310' })] })
    ).toBeNull();
  });
});
