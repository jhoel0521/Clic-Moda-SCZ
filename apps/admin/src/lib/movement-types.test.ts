import { describe, expect, it } from 'vitest';
import { defaultTypeCode, MAX_OPTIONS, SEE_ALL, typeOptions, type MovementTypeItem } from './movement-types';

const item = (code: string, kind: MovementTypeItem['kind'], active = true): MovementTypeItem => ({
  code,
  name: `Tipo ${code}`,
  kind,
  active,
  system: false,
  createdAt: '2026-11-12T10:00:00Z',
});

const withdrawals = (count: number) => Array.from({ length: count }, (_, index) => item(`W${index + 1}`, 'WITHDRAW'));

describe('typeOptions', () => {
  it('ofrece solo los tipos activos de la clase elegida, en el orden recibido', () => {
    const types = [item('A', 'RECEIVE'), item('B', 'WITHDRAW'), item('C', 'RECEIVE', false), item('D', 'RECEIVE')];

    expect(typeOptions(types, 'RECEIVE', false).map((option) => option.value)).toEqual(['A', 'D']);
  });

  it('con hasta 7 tipos los muestra todos', () => {
    expect(typeOptions(withdrawals(MAX_OPTIONS), 'WITHDRAW', false)).toHaveLength(7);
  });

  it('con más de 7 muestra 6 y la opción «Ver todos», sin pasar de 7 opciones', () => {
    const options = typeOptions(withdrawals(10), 'WITHDRAW', false);

    expect(options).toHaveLength(MAX_OPTIONS);
    expect(options.at(-1)).toEqual({ value: SEE_ALL, label: 'Ver todos (10)' });
  });

  it('al expandir muestra todos', () => {
    expect(typeOptions(withdrawals(10), 'WITHDRAW', true)).toHaveLength(10);
  });

  it('el tipo por omisión es el de sistema de la clase', () => {
    expect(defaultTypeCode('ADJUST')).toBe('ADJUST');
  });
});
