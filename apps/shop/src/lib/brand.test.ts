import { describe, expect, it } from 'vitest';
import { splitBrand } from './brand';

describe('splitBrand', () => {
  it('la primera palabra va aparte y el resto es el acento', () => {
    expect(splitBrand('Clic Moda SC')).toEqual({ lead: 'CLIC', accent: 'MODA SC' });
  });

  it('con una sola palabra no hay acento', () => {
    expect(splitBrand(' Moda ')).toEqual({ lead: 'MODA', accent: '' });
  });
});
