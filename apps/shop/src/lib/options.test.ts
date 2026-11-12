import { describe, expect, it } from 'vitest';
import type { VariantOption } from './catalog';
import { allOut, lowOnly, onlyAvailable } from './options';

const v = (availability: VariantOption['availability']): VariantOption => ({
  size: '39',
  color: 'Negro',
  sku: 'S',
  price: '1.00',
  availability,
});

describe('lowOnly', () => {
  it('avisa solo si todo lo que se puede comprar está en últimas unidades', () => {
    expect(lowOnly([v('low')])).toBe(true);
    expect(lowOnly([v('low'), v('out')])).toBe(true);
  });

  it('no avisa si hay otra variante con stock normal ni si no hay nada que comprar', () => {
    expect(lowOnly([v('low'), v('in_stock')])).toBe(false);
    expect(lowOnly([v('out')])).toBe(false);
  });
});

describe('allOut y onlyAvailable', () => {
  it('allOut exige que todas estén agotadas', () => {
    expect(allOut([v('out'), v('out')])).toBe(true);
    expect(allOut([v('out'), v('low')])).toBe(false);
  });

  it('oculta lo agotado mientras haya otras opciones, y si todo está agotado las deja', () => {
    expect(onlyAvailable(['a', 'b'], (value) => value === 'a')).toEqual(['b']);
    expect(onlyAvailable(['a', 'b'], () => true)).toEqual(['a', 'b']);
  });
});
