import { describe, expect, it } from 'vitest';
import { formatBs } from './format';

describe('formatBs', () => {
  it.each([
    ['349.90', 'Bs 349,90'],
    ['1349.9', 'Bs 1.349,90'],
    ['1000000.00', 'Bs 1.000.000,00'],
    ['5', 'Bs 5,00'],
    ['0.5', 'Bs 0,50'],
  ])('%s -> %s', (input, expected) => {
    expect(formatBs(input)).toBe(expected);
  });
});
