import { IllegalCommandTransitionError, StockInvariantError } from '../errors/inventory.errors.js';
import { MovementId, VariantId } from '../value-objects/ids.vo.js';
import {
  IdempotencyKey,
  Location,
  Operator,
  Quantity,
  Reason,
  ReorderLevel,
} from '../value-objects/stock-values.vo.js';
import { fingerprintOf, StockCommand } from './stock-command.entity.js';
import { StockLevel } from './stock-level.entity.js';

const empty = (): StockLevel => StockLevel.empty(VariantId.generate(), ReorderLevel.of(0));

const NOW = new Date('2026-11-10T10:00:00Z');
const LATER = new Date('2026-11-10T10:00:05Z');

const accept = (type: 'RECEIVE' | 'WITHDRAW' | 'ADJUST' = 'RECEIVE', units = 5): StockCommand =>
  StockCommand.accept(
    {
      variantId: VariantId.generate(),
      type,
      quantity: Quantity.positive(units),
      reason: Reason.of('Compra proveedor'),
      operator: Operator.of('u-1'),
      idempotencyKey: IdempotencyKey.of('clave-123456'),
    },
    NOW
  );

describe('StockCommand: estados', () => {
  it('nace PENDING sin resolver, sin intentos y con la hora de aceptación', () => {
    const command = accept();
    expect(command.status).toBe('PENDING');
    expect([command.attempts, command.resolvedAt, command.movementId, command.seq]).toEqual([
      0,
      null,
      null,
      null,
    ]);
    expect(command.acceptedAt).toEqual(NOW);
  });

  it('PENDING pasa a APPLIED con su movimiento', () => {
    const command = accept();
    const movement = MovementId.generate();
    command.apply(movement, LATER);
    expect([command.status, command.resolvedAt]).toEqual(['APPLIED', LATER]);
    expect(command.movementId?.equals(movement)).toBe(true);
  });

  it('PENDING pasa a REJECTED con su motivo', () => {
    const command = accept('WITHDRAW');
    command.reject('INSUFFICIENT_STOCK', LATER);
    expect([command.status, command.rejectReason]).toEqual(['REJECTED', 'INSUFFICIENT_STOCK']);
  });
});

describe('StockCommand: transiciones inválidas', () => {
  it('los estados finales no cambian: ni aplicar, ni rechazar, ni reintentar', () => {
    const applied = accept();
    applied.apply(MovementId.generate(), LATER);
    expect(() => applied.apply(MovementId.generate(), LATER)).toThrow(
      IllegalCommandTransitionError
    );
    expect(() => applied.reject('NO_CHANGE', LATER)).toThrow(IllegalCommandTransitionError);

    const rejected = accept();
    rejected.reject('NO_CHANGE', LATER);
    expect(() => rejected.apply(MovementId.generate(), LATER)).toThrow(
      IllegalCommandTransitionError
    );
    expect(() => rejected.scheduleRetry(1, LATER)).toThrow(IllegalCommandTransitionError);
  });

  it('scheduleRetry mantiene PENDING y programa la próxima hora', () => {
    const command = accept();
    command.scheduleRetry(2, LATER);
    expect([command.status, command.attempts, command.availableAt]).toEqual(['PENDING', 2, LATER]);
  });
});

describe('fingerprintOf', () => {
  const base = (units: number, reason = 'Compra proveedor') => ({
    variantId: VariantId.of('00000000-0000-4000-8000-000000000001'),
    type: 'RECEIVE' as const,
    quantity: Quantity.positive(units),
    reason: Reason.of(reason),
  });

  it('es igual para el mismo contenido y distinta si cambia la cantidad o el motivo', () => {
    expect(fingerprintOf(base(5))).toBe(fingerprintOf(base(5)));
    expect(fingerprintOf(base(5))).not.toBe(fingerprintOf(base(6)));
    expect(fingerprintOf(base(5))).not.toBe(fingerprintOf(base(5, 'Otro motivo')));
    expect(fingerprintOf(base(5))).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('StockLevel', () => {
  it('empieza en cero y el disponible es físico menos reservado', () => {
    const level = StockLevel.restore({
      variantId: VariantId.generate(),
      onHand: 10,
      reserved: 3,
      location: Location.of('A-2'),
      reorderLevel: ReorderLevel.of(7),
    });
    expect([empty().onHand, empty().available]).toEqual([0, 0]);
    expect([level.available, level.isLow]).toEqual([7, true]);
  });
});

describe('StockLevel: cambios', () => {
  it('applyDelta suma y resta, y no permite stock negativo ni por debajo de lo reservado', () => {
    const level = empty();
    level.applyDelta(5);
    level.applyDelta(-2);
    expect(level.onHand).toBe(3);
    expect(() => level.applyDelta(-4)).toThrow(StockInvariantError);
    expect(level.onHand).toBe(3);
  });

  it('cambia ubicación y umbral sin tocar las unidades', () => {
    const level = empty();
    level.applyDelta(4);
    level.changeSettings(Location.of('Caja 3'), ReorderLevel.of(2));
    expect([level.location?.value, level.reorderLevel.units, level.onHand]).toEqual([
      'Caja 3',
      2,
      4,
    ]);
  });
});
