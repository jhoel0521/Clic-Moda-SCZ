import { describe, expect, it } from 'vitest';
import { colorHex, initialOf, isPattern } from './colors';

describe('colorHex', () => {
  it('reconoce nombres sin importar mayúsculas ni tildes', () => {
    expect(colorHex('Coñac')).toBe(colorHex('conac'));
    expect(colorHex('CAFÉ OSCURO')).toBe('#3e2a20');
  });

  it('un nombre desconocido no tiene tono (se pinta neutro con su inicial)', () => {
    expect(colorHex('Verde agua')).toBeNull();
    expect(initialOf('verde agua')).toBe('V');
  });
});

describe('isPattern', () => {
  it('los estampados no son un tono liso', () => {
    expect(isPattern('Floral')).toBe(true);
    expect(isPattern('Negro')).toBe(false);
  });
});
