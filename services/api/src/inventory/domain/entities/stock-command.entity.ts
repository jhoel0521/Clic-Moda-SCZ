import { createHash } from 'node:crypto';
import { IllegalCommandTransitionError } from '../errors/inventory.errors.js';
import type { CommandStatus, CommandType, RejectReason } from '../value-objects/command-values.js';
import { CommandId, MovementId, type VariantId } from '../value-objects/ids.vo.js';
import { TypeCode } from '../value-objects/type-values.vo.js';
import type {
  IdempotencyKey,
  Operator,
  Quantity,
  Reason,
} from '../value-objects/stock-values.vo.js';

export interface StockCommandProps {
  id: CommandId;
  seq: number | null; // orden de llegada; lo asigna la cola al aceptar
  variantId: VariantId;
  type: CommandType;
  typeCode: TypeCode; // el motivo (dato administrable); `type` es la clase y decide cómo cambia el stock
  quantity: Quantity;
  reason: Reason;
  operator: Operator;
  idempotencyKey: IdempotencyKey | null;
  requestHash: string;
  status: CommandStatus;
  rejectReason: RejectReason | null;
  attempts: number;
  availableAt: Date;
  acceptedAt: Date;
  resolvedAt: Date | null;
  movementId: MovementId | null;
}

export interface AcceptInput {
  variantId: VariantId;
  type: CommandType;
  typeCode?: TypeCode; // sin código: el tipo de sistema de la clase (su código es el de la clase)
  quantity: Quantity;
  reason: Reason;
  operator: Operator;
  idempotencyKey: IdempotencyKey | null;
}

// Huella del contenido: sirve para distinguir un reintento legítimo de una clave reutilizada.
// El código del tipo solo entra en la huella cuando NO es el de sistema de la clase: así la huella de todo
// comando aceptado antes de los tipos (y la de los de sistema) es exactamente la de siempre.
export const fingerprintOf = (
  input: Pick<AcceptInput, 'variantId' | 'type' | 'quantity' | 'reason' | 'typeCode'>
): string => {
  const parts: (string | number)[] = [
    input.type,
    input.variantId.value,
    input.quantity.units,
    input.reason.value,
  ];
  if (input.typeCode && input.typeCode.value !== input.type) parts.push(input.typeCode.value);
  return createHash('sha256').update(JSON.stringify(parts)).digest('hex');
};

// Comando de stock. Máquina de estados: PENDING → APPLIED | REJECTED; los dos finales son inmutables.
export class StockCommand {
  private constructor(private props: StockCommandProps) {}

  static accept(input: AcceptInput, now: Date): StockCommand {
    const typeCode = input.typeCode ?? TypeCode.of(input.type);
    return new StockCommand({
      ...input,
      typeCode,
      id: CommandId.generate(),
      seq: null,
      requestHash: fingerprintOf({ ...input, typeCode }),
      status: 'PENDING',
      rejectReason: null,
      attempts: 0,
      availableAt: now,
      acceptedAt: now,
      resolvedAt: null,
      movementId: null,
    });
  }

  static restore(props: StockCommandProps): StockCommand {
    return new StockCommand({ ...props });
  }

  apply(movementId: MovementId, now: Date): void {
    this.assertPending('APPLIED');
    this.props = { ...this.props, status: 'APPLIED', movementId, resolvedAt: now };
  }

  reject(reason: RejectReason, now: Date): void {
    this.assertPending('REJECTED');
    this.props = { ...this.props, status: 'REJECTED', rejectReason: reason, resolvedAt: now };
  }

  // Un intento de procesamiento que falló: sigue PENDING y espera hasta `retryAt`.
  scheduleRetry(attempts: number, retryAt: Date): void {
    this.assertPending('PENDING');
    this.props = { ...this.props, attempts, availableAt: retryAt };
  }

  private assertPending(to: CommandStatus): void {
    if (this.props.status !== 'PENDING')
      throw new IllegalCommandTransitionError(this.props.status, to);
  }

  get snapshot(): Readonly<StockCommandProps> {
    return this.props;
  }

  get id(): CommandId {
    return this.props.id;
  }

  get seq(): number | null {
    return this.props.seq;
  }

  get variantId(): VariantId {
    return this.props.variantId;
  }

  get type(): CommandType {
    return this.props.type;
  }

  get typeCode(): TypeCode {
    return this.props.typeCode;
  }

  get quantity(): Quantity {
    return this.props.quantity;
  }

  get reason(): Reason {
    return this.props.reason;
  }

  get operator(): Operator {
    return this.props.operator;
  }

  get idempotencyKey(): IdempotencyKey | null {
    return this.props.idempotencyKey;
  }

  get requestHash(): string {
    return this.props.requestHash;
  }

  get status(): CommandStatus {
    return this.props.status;
  }

  get rejectReason(): RejectReason | null {
    return this.props.rejectReason;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get availableAt(): Date {
    return this.props.availableAt;
  }

  get acceptedAt(): Date {
    return this.props.acceptedAt;
  }

  get resolvedAt(): Date | null {
    return this.props.resolvedAt;
  }

  get movementId(): MovementId | null {
    return this.props.movementId;
  }
}
