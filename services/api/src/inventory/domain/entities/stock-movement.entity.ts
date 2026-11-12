import type { CommandType } from '../value-objects/command-values.js';
import type { CommandId, MovementId, VariantId } from '../value-objects/ids.vo.js';
import type { TypeCode } from '../value-objects/type-values.vo.js';
import type { Operator, Reason } from '../value-objects/stock-values.vo.js';

export interface StockMovementProps {
  readonly id: MovementId;
  readonly variantId: VariantId;
  readonly commandId: CommandId;
  readonly type: CommandType;
  readonly typeCode: TypeCode;
  readonly delta: number; // distinto de cero: positivo ingresa, negativo retira
  readonly balanceAfter: number; // unidades físicas que quedaron DESPUÉS de aplicarlo (nunca negativo)
  readonly reason: Reason;
  readonly operator: Operator;
  readonly occurredAt: Date;
}

// Registro inmutable de un cambio de stock: no tiene métodos que lo modifiquen.
export class StockMovement {
  private constructor(readonly props: StockMovementProps) {}

  static restore(props: StockMovementProps): StockMovement {
    return new StockMovement(Object.freeze({ ...props }));
  }

  get id(): MovementId {
    return this.props.id;
  }

  get variantId(): VariantId {
    return this.props.variantId;
  }

  get commandId(): CommandId {
    return this.props.commandId;
  }

  get type(): CommandType {
    return this.props.type;
  }

  get typeCode(): TypeCode {
    return this.props.typeCode;
  }

  get delta(): number {
    return this.props.delta;
  }

  get balanceAfter(): number {
    return this.props.balanceAfter;
  }

  get reason(): Reason {
    return this.props.reason;
  }

  get operator(): Operator {
    return this.props.operator;
  }

  get occurredAt(): Date {
    return this.props.occurredAt;
  }
}
