import { StockCommand } from './entities/stock-command.entity.js';
import { StockLevel } from './entities/stock-level.entity.js';
import { VariantId } from './value-objects/ids.vo.js';
import { Operator, Quantity, Reason, ReorderLevel } from './value-objects/stock-values.vo.js';
import { StockPolicy } from './stock-policy.js';

const command = (type: 'RECEIVE' | 'WITHDRAW' | 'ADJUST', units: number): StockCommand =>
  StockCommand.accept(
    {
      variantId: VariantId.generate(),
      type,
      quantity: type === 'ADJUST' ? Quantity.count(units) : Quantity.positive(units),
      reason: Reason.of('Prueba de política'),
      operator: Operator.of('u-1'),
      idempotencyKey: null,
    },
    new Date()
  );

const level = (onHand: number, reserved = 0): StockLevel =>
  StockLevel.restore({
    variantId: VariantId.generate(),
    onHand,
    reserved,
    location: null,
    reorderLevel: ReorderLevel.of(0),
  });

describe('StockPolicy: ingresos y salidas', () => {
  it('un ingreso siempre se aplica con delta positivo', () => {
    expect(StockPolicy.decide(command('RECEIVE', 12), level(0))).toEqual({
      kind: 'APPLY',
      delta: 12,
    });
  });

  it('una salida se aplica si hay disponible, incluido el borde exacto', () => {
    expect(StockPolicy.decide(command('WITHDRAW', 3), level(3))).toEqual({
      kind: 'APPLY',
      delta: -3,
    });
    expect(StockPolicy.decide(command('WITHDRAW', 1), level(5, 2))).toEqual({
      kind: 'APPLY',
      delta: -1,
    });
  });

  it('una salida mayor al disponible se rechaza; lo reservado no está disponible', () => {
    const rejected = { kind: 'REJECT', reason: 'INSUFFICIENT_STOCK' };
    expect(StockPolicy.decide(command('WITHDRAW', 4), level(3))).toEqual(rejected);
    expect(StockPolicy.decide(command('WITHDRAW', 4), level(5, 2))).toEqual(rejected);
    expect(StockPolicy.decide(command('WITHDRAW', 1), level(0))).toEqual(rejected);
  });
});

describe('StockPolicy: ajustes por conteo', () => {
  it('calcula el delta contra el stock de ese instante, hacia arriba o hacia abajo', () => {
    expect(StockPolicy.decide(command('ADJUST', 8), level(10))).toEqual({
      kind: 'APPLY',
      delta: -2,
    });
    expect(StockPolicy.decide(command('ADJUST', 15), level(10))).toEqual({
      kind: 'APPLY',
      delta: 5,
    });
  });

  it('un conteo igual al stock no cambia nada y se rechaza como NO_CHANGE', () => {
    expect(StockPolicy.decide(command('ADJUST', 10), level(10))).toEqual({
      kind: 'REJECT',
      reason: 'NO_CHANGE',
    });
  });
});

describe('StockPolicy: ajustes y reservas', () => {
  it('un conteo por debajo de lo reservado se rechaza; igual a lo reservado se aplica', () => {
    expect(StockPolicy.decide(command('ADJUST', 1), level(10, 3))).toEqual({
      kind: 'REJECT',
      reason: 'BELOW_RESERVED',
    });
    expect(StockPolicy.decide(command('ADJUST', 3), level(10, 3))).toEqual({
      kind: 'APPLY',
      delta: -7,
    });
  });

  it('contar cero con stock físico lo deja en cero', () => {
    expect(StockPolicy.decide(command('ADJUST', 0), level(4))).toEqual({
      kind: 'APPLY',
      delta: -4,
    });
  });
});
