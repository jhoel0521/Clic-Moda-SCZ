import type { StockCommand } from '../../domain/entities/stock-command.entity.js';

export class EnqueueStockCommand {
  constructor(
    readonly variantId: string,
    readonly type: string,
    readonly units: number,
    readonly reason: string,
    readonly operator: string,
    readonly idempotencyKey?: string | null
  ) {}
}

export class GetStockCommandQuery {
  constructor(readonly id: string) {}
}

export class UpdateStockSettingsCommand {
  constructor(
    readonly variantId: string,
    readonly location: string | null,
    readonly reorderLevel: number
  ) {}
}

export interface StockCommandResult {
  readonly id: string;
  readonly seq: number | null;
  readonly variantId: string;
  readonly type: string;
  readonly units: number;
  readonly reason: string;
  readonly operator: string;
  readonly status: string;
  readonly rejectReason: string | null;
  readonly attempts: number;
  readonly acceptedAt: string;
  readonly resolvedAt: string | null;
  readonly movementId: string | null;
}

export interface EnqueueResult {
  readonly command: StockCommandResult;
  readonly created: boolean;
}

export const toCommandResult = (command: StockCommand): StockCommandResult => ({
  id: command.id.value,
  seq: command.seq,
  variantId: command.variantId.value,
  type: command.type,
  units: command.quantity.units,
  reason: command.reason.value,
  operator: command.operator.value,
  status: command.status,
  rejectReason: command.rejectReason,
  attempts: command.attempts,
  acceptedAt: command.acceptedAt.toISOString(),
  resolvedAt: command.resolvedAt?.toISOString() ?? null,
  movementId: command.movementId?.value ?? null,
});

// --- Lecturas ---
export interface StockQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly text?: string;
  // Solo variantes activas agotadas (disponible 0 o menos).
  readonly soldOut?: boolean;
  // Paginar por PRODUCTO: cada página trae todas las variantes (que cumplan el filtro) de sus productos,
  // y `total` cuenta productos. Así un producto nunca queda partido entre dos páginas.
  readonly byProduct?: boolean;
}

export type LowStockQuery = StockQuery;

export interface StockRow {
  readonly variantId: string;
  readonly sku: string;
  readonly productName: string;
  readonly size: string;
  readonly color: string | null;
  readonly active: boolean;
  readonly onHand: number;
  readonly reserved: number;
  readonly available: number;
  readonly location: string | null;
  readonly reorderLevel: number;
}

export interface StockPage {
  readonly items: readonly StockRow[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface MovementsQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly type?: string;
  readonly from?: Date;
  readonly to?: Date;
}

export interface MovementRow {
  readonly id: string;
  readonly type: string;
  readonly delta: number;
  readonly reason: string;
  readonly operator: string;
  readonly occurredAt: string;
}

export interface MovementPage {
  readonly items: readonly MovementRow[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface QueueStatusResult {
  readonly pending: number;
  readonly oldestPendingAgeSeconds: number | null;
}
