import { describe, expect, it } from 'vitest';
import { normalizeRef, resolveRef } from './ref';

const url = (query: string) => new URL(`https://tienda.test/p/bota${query}`);

describe('normalizeRef', () => {
  it('pasa a minúsculas y acepta letras, dígitos, guion y guion bajo hasta 32', () => {
    expect(normalizeRef('Live-Nov')).toBe('live-nov');
    expect(normalizeRef('a_b-9')).toBe('a_b-9');
    expect(normalizeRef('x'.repeat(32))).toBe('x'.repeat(32));
  });

  it.each(['', '  ', 'con espacio', 'raro!', 'ñandú', 'x'.repeat(33), '<script>', null, undefined])(
    'ignora %j',
    (raw) => {
      expect(normalizeRef(raw)).toBeNull();
    }
  );
});

describe('resolveRef', () => {
  it('un enlace con ref válido lo usa y pide guardarlo', () => {
    expect(resolveRef(url('?ref=Live-Nov'), undefined)).toEqual({
      ref: 'live-nov',
      remember: true,
    });
  });

  it('sin ref en el enlace usa el recordado y no vuelve a guardar', () => {
    expect(resolveRef(url(''), 'live-nov')).toEqual({ ref: 'live-nov', remember: false });
  });

  it('el mismo código no se guarda dos veces', () => {
    expect(resolveRef(url('?ref=live-nov'), 'live-nov').remember).toBe(false);
  });

  it('un ref inválido se ignora y se conserva el recordado', () => {
    expect(resolveRef(url('?ref=raro!'), 'live-nov')).toEqual({ ref: 'live-nov', remember: false });
  });

  it('una cookie manipulada no se acepta', () => {
    expect(resolveRef(url(''), '<img src=x>')).toEqual({ ref: null, remember: false });
  });
});
