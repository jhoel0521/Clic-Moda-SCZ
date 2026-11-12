import { describe, expect, it } from 'vitest';
import type { VariantOption } from './catalog';
import { cardView, variantPath } from './card-variants';

const v = (
  size: string,
  color: string | null,
  price: string,
  availability: VariantOption['availability'] = 'in_stock'
): VariantOption => ({ size, color, sku: `S-${size}-${color ?? ''}`, price, availability });

describe('cardView: qué variante muestra la tarjeta', () => {
  it('elige la más barata que se puede comprar y lista las tallas de su color en orden', () => {
    const view = cardView([
      v('37', 'Rojo', '350'),
      v('36', 'Rojo', '305'),
      v('36', 'Negro', '400'),
    ]);

    expect(view?.featured).toMatchObject({ size: '36', color: 'Rojo', price: '305' });
    expect(view?.chips.map((chip) => chip.size)).toEqual(['36', '37']);
    expect(view?.moreColors).toBe(1);
  });

  it('una talla agotada más barata no se elige', () => {
    const view = cardView([v('36', 'Rojo', '200', 'out'), v('37', 'Rojo', '350')]);

    expect(view?.featured.size).toBe('37');
  });

  it('con todo agotado muestra la primera y no falla', () => {
    const view = cardView([v('36', 'Rojo', '305', 'out'), v('37', 'Rojo', '350', 'out')]);

    expect(view?.featured.size).toBe('36');
  });
});

describe('cardView: tallas', () => {
  it('las tallas se ordenan como número ("9" antes que "10")', () => {
    const view = cardView([v('10', 'Rojo', '1'), v('9', 'Rojo', '1')]);

    expect(view?.chips.map((chip) => chip.size)).toEqual(['9', '10']);
  });

  it('marca que las tallas del color cuestan distinto solo cuando es así', () => {
    expect(cardView([v('36', 'Rojo', '305'), v('37', 'Rojo', '350')])?.chipPrices).toBe(true);
    expect(cardView([v('36', 'Rojo', '305'), v('37', 'Rojo', '305')])?.chipPrices).toBe(false);
  });

  it('sin variantes no hay vista', () => {
    expect(cardView([])).toBeNull();
  });
});

describe('variantPath', () => {
  it('lleva la talla y el color elegidos', () => {
    expect(variantPath('sandalia-roja', v('36', 'Rojo', '305'))).toBe(
      '/p/sandalia-roja?talla=36&color=Rojo'
    );
  });

  it('sin color solo lleva la talla', () => {
    expect(variantPath('sandalia', v('36', null, '305'))).toBe('/p/sandalia?talla=36');
  });
});
