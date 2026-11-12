import { aggregateAvailability, availabilityOf, LOW_STOCK_MAX } from './availability.js';

describe('availabilityOf', () => {
  it.each([
    [-2, 'out'],
    [0, 'out'],
    [1, 'low'],
    [LOW_STOCK_MAX, 'low'],
    [LOW_STOCK_MAX + 1, 'in_stock'],
    [500, 'in_stock'],
  ])('%i unidades -> %s', (units, expected) => {
    expect(availabilityOf(units)).toBe(expected);
  });
});

describe('aggregateAvailability', () => {
  it('out solo si todas las variantes están agotadas', () => {
    expect(aggregateAvailability(['out', 'out'])).toBe('out');
    expect(aggregateAvailability(['out', 'low'])).toBe('low');
  });

  it('in_stock si alguna variante tiene stock normal', () => {
    expect(aggregateAvailability(['out', 'low', 'in_stock'])).toBe('in_stock');
  });

  it('sin variantes no hay nada que vender', () => {
    expect(aggregateAvailability([])).toBe('out');
  });
});
