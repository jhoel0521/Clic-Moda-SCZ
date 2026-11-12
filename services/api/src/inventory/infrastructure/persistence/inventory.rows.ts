import { StockCommand } from '../../domain/entities/stock-command.entity.js';
import { StockLevel } from '../../domain/entities/stock-level.entity.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import {
  type CommandStatus,
  parseCommandType,
  type RejectReason,
} from '../../domain/value-objects/command-values.js';
import { CommandId, MovementId, VariantId } from '../../domain/value-objects/ids.vo.js';
import { TypeCode } from '../../domain/value-objects/type-values.vo.js';
import {
  IdempotencyKey,
  Location,
  Operator,
  Quantity,
  Reason,
  ReorderLevel,
} from '../../domain/value-objects/stock-values.vo.js';

// Filas tal como las devuelve PostgreSQL (SQL directo: la cola y el stock necesitan control fino).
export interface CommandRow {
  id: string;
  seq: string; // bigint llega como texto
  variant_id: string;
  type: string;
  type_code: string;
  quantity: number;
  reason: string;
  operator: string;
  idempotency_key: string | null;
  request_hash: string;
  status: string;
  reject_reason: string | null;
  attempts: number;
  available_at: Date;
  accepted_at: Date;
  resolved_at: Date | null;
  movement_id: string | null;
}

export interface LevelRow {
  variant_id: string;
  on_hand: number;
  reserved: number;
  location: string | null;
  reorder_level: number;
}

export interface MovementRow {
  id: string;
  variant_id: string;
  command_id: string;
  type: string;
  type_code: string;
  balance_after: number;
  delta: number;
  reason: string;
  operator: string;
  occurred_at: Date;
}

export const toCommand = (row: CommandRow): StockCommand =>
  StockCommand.restore({
    id: CommandId.of(row.id),
    seq: Number(row.seq),
    variantId: VariantId.of(row.variant_id),
    type: parseCommandType(row.type),
    typeCode: TypeCode.of(row.type_code),
    quantity: Quantity.count(row.quantity),
    reason: Reason.of(row.reason),
    operator: Operator.of(row.operator),
    idempotencyKey: row.idempotency_key ? IdempotencyKey.of(row.idempotency_key) : null,
    requestHash: row.request_hash.trim(),
    status: row.status as CommandStatus,
    rejectReason: row.reject_reason as RejectReason | null,
    attempts: row.attempts,
    availableAt: row.available_at,
    acceptedAt: row.accepted_at,
    resolvedAt: row.resolved_at,
    movementId: row.movement_id ? MovementId.of(row.movement_id) : null,
  });

export const toLevel = (row: LevelRow): StockLevel =>
  StockLevel.restore({
    variantId: VariantId.of(row.variant_id),
    onHand: row.on_hand,
    reserved: row.reserved,
    location: row.location ? Location.of(row.location) : null,
    reorderLevel: ReorderLevel.of(row.reorder_level),
  });

export const toMovement = (row: MovementRow): StockMovement =>
  StockMovement.restore({
    id: MovementId.of(row.id),
    variantId: VariantId.of(row.variant_id),
    commandId: CommandId.of(row.command_id),
    type: parseCommandType(row.type),
    typeCode: TypeCode.of(row.type_code),
    balanceAfter: row.balance_after,
    delta: row.delta,
    reason: Reason.of(row.reason),
    operator: Operator.of(row.operator),
    occurredAt: row.occurred_at,
  });

// Espacios de claves de los bloqueos consultivos: el encolado y el procesamiento NO comparten clave,
// para que encolar no espere a que termine el procesamiento de la misma variante.
export const NS_ENQUEUE = 1;
export const NS_PROCESS = 2;

// TypeORM devuelve [filas, cantidad] en UPDATE ... RETURNING de PostgreSQL y solo las filas en SELECT e
// INSERT. Esta función normaliza ambos casos para no confundir la cantidad con una fila.
export function rowsOf<T>(result: unknown): T[] {
  const list = result as unknown[];
  return (Array.isArray(list[0]) ? list[0] : list) as T[];
}
