import { describe, expect, it } from 'vitest';
import type { VariantOption } from './catalog';
import { cardView, variantPath } from './card-variants';

const v = (
  size: string,
  color: string | null,
  price: string,
  availability: VariantOption['availability'] = 'in_stock'
): VariantOption => ({ size, color, sku: `S-${size}-${color ?? ''}`, price, availability });

describe('cardView: variante mostrada', () => {
  it('elige la más barata que se puede comprar', () => {
    const view = cardView([
      v('37', 'Rojo', '350'),
      v('36', 'Rojo', '305'),
      v('36', 'Negro', '400'),
    ]);

    expect(view?.featured).toMatchObject({ size: '36', color: 'Rojo', price: '305' });
  });

  it('una talla agotada más barata no se elige', () => {
    expect(cardView([v('36', 'Rojo', '200', 'out'), v('37', 'Rojo', '350')])?.featured.size).toBe(
      '37'
    );
  });

  it('sin variantes no hay vista', () => {
    expect(cardView([])).toBeNull();
  });
});

describe('cardView: resumen en texto', () => {
  it('con pocas tallas las lista; con muchas, cuántas son y entre qué números', () => {
    const few = cardView([v('37', 'Rojo', '1'), v('36', 'Rojo', '1')]);
    const many = cardView(['36', '37', '38', '39', '43'].map((size) => v(size, 'Rojo', '1')));

    expect(few?.summary).toBe('Tallas 36, 37');
    expect(many?.summary).toBe('5 tallas, de 36 a 43');
  });

  it('las tallas se ordenan como número ("9" antes que "10")', () => {
    expect(cardView([v('10', 'Rojo', '1'), v('9', 'Rojo', '1')])?.summary).toBe('Tallas 9, 10');
  });

  it('con varios colores lo dice con un número y no cuenta los agotados', () => {
    const view = cardView([
      v('36', 'Rojo', '1'),
      v('37', 'Negro', '1'),
      v('38', 'Azul', '1', 'out'),
    ]);

    expect(view?.summary).toBe('2 colores · Tallas 36, 37');
  });

  it('con una sola talla y un solo color no hay nada que sumar', () => {
    expect(cardView([v('36', 'Rojo', '1')])?.summary).toBe('');
  });
});

describe('cardView: todo agotado', () => {
  it('se marca agotado y no resume nada', () => {
    const view = cardView([v('36', 'Rojo', '305', 'out'), v('37', 'Rojo', '350', 'out')]);

    expect([view?.soldOut, view?.summary]).toEqual([true, '']);
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
