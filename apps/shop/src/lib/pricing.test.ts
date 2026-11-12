import { describe, expect, it } from 'vitest';
import type { VariantOption } from './catalog';
import { cardPrice, optionPrice, priceView } from './pricing';

const variant = (size: string, price: string, color: string | null = 'Rojo'): VariantOption => ({
  size,
  color,
  sku: `S-${size}`,
  price,
  availability: 'in_stock',
});

describe('cardPrice', () => {
  it('con precios distintos dice "Desde"', () => {
    expect(cardPrice({ price: '305.00', priceVaries: true })).toBe('Desde Bs 305,00');
  });

  it('con el mismo precio en todo lo muestra solo', () => {
    expect(cardPrice({ price: '305.00', priceVaries: false })).toBe('Bs 305,00');
  });
});

describe('priceView', () => {
  it('con una variante elegida da SU precio y dice cuál es', () => {
    const view = priceView({ price: '305.00', priceVaries: true }, variant('37', '350.00'));

    expect(view).toEqual({ text: 'Bs 350,00', note: 'Talla 37 · Rojo' });
  });

  it('sin elegir y con precios distintos pide elegir para ver el precio', () => {
    const view = priceView({ price: '305.00', priceVaries: true }, null);

    expect(view.text).toBe('Desde Bs 305,00');
    expect(view.note).toMatch(/Elige talla y color/);
  });

  it('sin elegir y con un solo precio aclara que vale para todas las tallas y colores', () => {
    const view = priceView({ price: '305.00', priceVaries: false }, null);

    expect(view).toEqual({
      text: 'Bs 305,00',
      note: 'El mismo precio en todas las tallas y colores',
    });
  });

  it('una variante sin color solo nombra la talla', () => {
    expect(priceView({ price: '5.00', priceVaries: false }, variant('38', '5.00', null)).note).toBe(
      'Talla 38'
    );
  });
});

describe('optionPrice', () => {
  it('un precio solo se muestra tal cual', () => {
    expect(optionPrice([variant('36', '305.00')])).toBe('Bs 305,00');
  });

  it('si la opción reúne precios distintos dice "Desde" el menor', () => {
    const options = [variant('36', '350.00'), variant('36', '305.00', 'Negro')];

    expect(optionPrice(options)).toBe('Desde Bs 305,00');
  });

  it('sin variantes no hay precio', () => {
    expect(optionPrice([])).toBeNull();
  });
});
