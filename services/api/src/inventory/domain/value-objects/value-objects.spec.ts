import {
  InvalidCommandTypeError,
  InvalidIdempotencyKeyError,
  InvalidInventoryIdError,
  InvalidLocationError,
  InvalidOperatorError,
  InvalidQuantityError,
  InvalidReasonError,
  InvalidReorderLevelError,
} from '../errors/inventory.errors.js';
import { parseCommandType, RETRY_POLICY } from './command-values.js';
import { CommandId, MovementId, VariantId } from './ids.vo.js';
import {
  IdempotencyKey,
  Location,
  Operator,
  Quantity,
  Reason,
  ReorderLevel,
} from './stock-values.vo.js';

describe('Quantity', () => {
  it('positive acepta de 1 a 1000000 y count acepta además el 0', () => {
    expect(Quantity.positive(1).units).toBe(1);
    expect(Quantity.positive(1_000_000).units).toBe(1_000_000);
    expect(Quantity.count(0).units).toBe(0);
  });

  it.each([0, -1, 1.5, 1_000_001, Number.NaN])('positive rechaza %s', (units) => {
    expect(() => Quantity.positive(units)).toThrow(InvalidQuantityError);
  });

  it.each([-1, 2.5, 1_000_001])('count rechaza %s', (units) => {
    expect(() => Quantity.count(units)).toThrow(InvalidQuantityError);
  });
});

describe('Reason, Operator y Location', () => {
  it('Reason normaliza espacios y exige de 3 a 200 caracteres', () => {
    expect(Reason.of('  Compra   proveedor ').value).toBe('Compra proveedor');
    for (const raw of ['', 'ab', '  a ', 'x'.repeat(201)]) {
      expect(() => Reason.of(raw)).toThrow(InvalidReasonError);
    }
  });

  it('Operator exige de 1 a 100 caracteres', () => {
    expect(Operator.of(' u-1 ').value).toBe('u-1');
    for (const raw of ['', ' ', 'x'.repeat(101)]) {
      expect(() => Operator.of(raw)).toThrow(InvalidOperatorError);
    }
  });

  it('Location acepta hasta 40 caracteres', () => {
    expect(Location.of('Estante  A-2').value).toBe('Estante A-2');
    expect(() => Location.of('x'.repeat(41))).toThrow(InvalidLocationError);
    expect(() => Location.of('  ')).toThrow(InvalidLocationError);
  });
});

describe('IdempotencyKey y ReorderLevel', () => {
  it('IdempotencyKey acepta de 8 a 64 caracteres permitidos', () => {
    expect(IdempotencyKey.of(' abc-1234:x.y_z ').value).toBe('abc-1234:x.y_z');
    for (const raw of ['corta', 'con espacio 123', 'x'.repeat(65), 'ñandú-12345']) {
      expect(() => IdempotencyKey.of(raw)).toThrow(InvalidIdempotencyKeyError);
    }
  });

  it('ReorderLevel acepta enteros de 0 a 1000000', () => {
    expect(ReorderLevel.of(0).units).toBe(0);
    for (const units of [-1, 1.5, 1_000_001]) {
      expect(() => ReorderLevel.of(units)).toThrow(InvalidReorderLevelError);
    }
  });
});

describe('Tipos, identificadores y reintentos', () => {
  it('parseCommandType normaliza y rechaza lo desconocido', () => {
    expect(parseCommandType(' receive ')).toBe('RECEIVE');
    expect(() => parseCommandType('DELETE')).toThrow(InvalidCommandTypeError);
  });

  it('los identificadores validan el UUID y no se confunden entre tipos', () => {
    const value = VariantId.generate().value;
    expect(VariantId.of(value.toUpperCase()).value).toBe(value);
    expect(() => CommandId.of('x')).toThrow(InvalidInventoryIdError);
    expect(() => MovementId.of('')).toThrow(InvalidInventoryIdError);
    expect(VariantId.of(value).equals(CommandId.of(value) as unknown as VariantId)).toBe(false);
  });

  it('la espera entre reintentos crece de forma exponencial hasta 5 intentos', () => {
    expect(RETRY_POLICY.maxAttempts).toBe(5);
    expect([1, 2, 3].map(RETRY_POLICY.backoffMs)).toEqual([500, 1000, 2000]);
  });
});
