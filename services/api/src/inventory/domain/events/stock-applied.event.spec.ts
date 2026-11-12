import { StockMovement } from '../entities/stock-movement.entity.js';
import { CommandId, MovementId, VariantId } from '../value-objects/ids.vo.js';
import { Operator, Reason } from '../value-objects/stock-values.vo.js';
import { TypeCode } from '../value-objects/type-values.vo.js';
import { STOCK_APPLIED, StockApplied } from './stock-applied.event.js';

const NOW = new Date('2026-11-12T10:00:00Z');
const movement = StockMovement.restore({
  id: MovementId.generate(),
  variantId: VariantId.generate(),
  commandId: CommandId.generate(),
  type: 'WITHDRAW',
  typeCode: TypeCode.of('SALE'),
  delta: -2,
  balanceAfter: 8,
  reason: Reason.of('Venta del Live del sábado'),
  operator: Operator.of('usuario-privado-1'),
  occurredAt: NOW,
});

describe('StockApplied', () => {
  it('lleva lo que cambió y cómo quedó, y el disponible descuenta lo reservado', () => {
    const event = StockApplied.of(movement, 3);

    expect(event.type).toBe(STOCK_APPLIED);
    expect(event.aggregateId).toBe(movement.variantId.value);
    expect(event.toPayload()).toMatchObject({
      typeCode: 'SALE',
      kind: 'WITHDRAW',
      delta: -2,
      onHandAfter: 8,
      availableAfter: 5,
    });
  });
});

describe('StockApplied: privacidad', () => {
  it('solo expone las claves permitidas: nunca el motivo, el operador ni datos de personas', () => {
    const payload = StockApplied.of(movement, 0).toPayload();

    expect(Object.keys(payload).sort()).toEqual([
      'availableAfter',
      'delta',
      'kind',
      'movementId',
      'occurredAt',
      'onHandAfter',
      'typeCode',
      'variantId',
    ]);
    expect(JSON.stringify(payload)).not.toMatch(/Venta del Live|usuario-privado/);
  });
});
