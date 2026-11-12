import { SystemTypeProtectedError } from '../errors/movement-type.errors.js';
import { TypeCode, TypeName } from '../value-objects/type-values.vo.js';
import { MovementType } from './movement-type.entity.js';

const NOW = new Date('2026-11-12T10:00:00Z');
const created = (name: string): MovementType =>
  MovementType.create({ name: TypeName.of(name), kind: 'RECEIVE', takenCodes: new Set() }, NOW);
const codeOf = (name: string, taken: string[] = []): string =>
  TypeCode.fromName(TypeName.of(name), new Set(taken)).value;

describe('TypeName', () => {
  it('limpia espacios y exige de 3 a 60 caracteres', () => {
    expect(TypeName.of('  Cambio   por talla ').value).toBe('Cambio por talla');
    expect(() => TypeName.of('ab')).toThrow('entre 3 y 60');
    expect(() => TypeName.of('x'.repeat(61))).toThrow('entre 3 y 60');
  });
});

describe('TypeCode: generado desde el nombre', () => {
  it('quita acentos y símbolos y usa mayúsculas con guion bajo', () => {
    expect(codeOf('Devolución de niño!')).toBe('DEVOLUCION_DE_NINO');
  });

  it('agrega un sufijo numérico si el código ya existe', () => {
    expect(codeOf('Cambio por talla', ['CAMBIO_POR_TALLA', 'CAMBIO_POR_TALLA_2'])).toBe(
      'CAMBIO_POR_TALLA_3'
    );
  });

  it('no pasa de 30 caracteres ni con sufijo', () => {
    const long = 'Ingreso por compra al por mayor de zapatos';
    const first = codeOf(long);
    const second = codeOf(long, [first]);

    expect([first.length <= 30, second.length <= 30, second.endsWith('_2')]).toEqual([
      true,
      true,
      true,
    ]);
  });
});

describe('TypeCode: casos límite', () => {
  it('un nombre solo de símbolos o de un carácter válido genera un código válido', () => {
    expect(codeOf('---')).toBe('TIPO');
    expect(codeOf('A!!')).toBe('TIPO_A');
  });

  it('rechaza un código escrito a mano con formato inválido', () => {
    expect(() => TypeCode.of('compra')).toThrow('no es un código de tipo válido');
    expect(() => TypeCode.of('A')).toThrow();
    expect(() => TypeCode.of('X'.repeat(31))).toThrow();
  });
});

describe('MovementType: alta y cambios', () => {
  it('nace activo, no es de sistema y su código sale del nombre', () => {
    const type = created('Cambio por talla');

    expect([type.code.value, type.active, type.system, type.kind]).toEqual([
      'CAMBIO_POR_TALLA',
      true,
      false,
      'RECEIVE',
    ]);
  });

  it('se renombra sin cambiar código ni clase', () => {
    const type = created('Cambio por talla');
    type.rename(TypeName.of('Cambio de talla'));

    expect([type.name.value, type.code.value]).toEqual(['Cambio de talla', 'CAMBIO_POR_TALLA']);
  });
});

describe('MovementType: desactivar', () => {
  it('se desactiva y se reactiva', () => {
    const type = created('Cambio por talla');
    type.deactivate();
    const off = type.active;
    type.activate();

    expect([off, type.active]).toEqual([false, true]);
  });

  it('un tipo de sistema no se puede desactivar', () => {
    const system = MovementType.restore({
      code: TypeCode.of('RECEIVE'),
      name: TypeName.of('Ingreso'),
      kind: 'RECEIVE',
      active: true,
      system: true,
      createdAt: NOW,
    });

    expect(() => system.deactivate()).toThrow(SystemTypeProtectedError);
    expect(system.active).toBe(true);
  });
});
