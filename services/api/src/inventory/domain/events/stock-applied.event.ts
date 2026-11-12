import type { StockMovement } from '../entities/stock-movement.entity.js';
import type { CommandType } from '../value-objects/command-values.js';

export const STOCK_APPLIED = 'stock.applied';

// Lo ÚNICO que viaja en el evento: lo que cambió y cómo quedó. A propósito no lleva el motivo escrito
// por el personal, ni el operador, ni datos de personas.
export interface StockAppliedPayload {
  readonly variantId: string;
  readonly movementId: string;
  readonly typeCode: string;
  readonly kind: CommandType;
  readonly delta: number;
  readonly onHandAfter: number;
  readonly availableAfter: number;
  readonly occurredAt: string;
}

// Hecho consumado: el stock de una variante cambió. Un objeto de valor del dominio; el adaptador de
// procesamiento lo guarda con el mismo cambio y otros contextos lo escuchan.
export class StockApplied {
  private constructor(private readonly payload: StockAppliedPayload) {}

  // `reserved`: unidades reservadas después del cambio (el disponible es físico menos reservado).
  static of(movement: StockMovement, reserved: number): StockApplied {
    return new StockApplied({
      variantId: movement.variantId.value,
      movementId: movement.id.value,
      typeCode: movement.typeCode.value,
      kind: movement.type,
      delta: movement.delta,
      onHandAfter: movement.balanceAfter,
      availableAfter: movement.balanceAfter - reserved,
      occurredAt: movement.occurredAt.toISOString(),
    });
  }

  get type(): string {
    return STOCK_APPLIED;
  }

  get aggregateId(): string {
    return this.payload.variantId;
  }

  get occurredAt(): Date {
    return new Date(this.payload.occurredAt);
  }

  toPayload(): StockAppliedPayload {
    return { ...this.payload };
  }
}
