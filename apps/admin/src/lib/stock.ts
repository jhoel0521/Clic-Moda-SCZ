import { api } from './client-api';

export type MovementKind = 'RECEIVE' | 'WITHDRAW' | 'ADJUST';

export interface StockRow {
  variantId: string;
  sku: string;
  productName: string;
  size: string;
  color: string | null;
  active: boolean;
  onHand: number;
  reserved: number;
  available: number;
  location: string | null;
  reorderLevel: number;
}

export interface StockCommand {
  id: string;
  status: 'PENDING' | 'APPLIED' | 'REJECTED';
  rejectReason: string | null;
  type: MovementKind;
  units: number;
}

export interface MovementItem {
  id: string;
  type: MovementKind;
  delta: number;
  reason: string;
  operator: string;
  occurredAt: string;
}

export const KIND_LABELS: Record<MovementKind, string> = {
  RECEIVE: 'Ingreso',
  WITHDRAW: 'Salida',
  ADJUST: 'Ajuste por conteo',
};

export const KIND_UNITS_LABEL: Record<MovementKind, string> = {
  RECEIVE: 'Unidades que ingresan',
  WITHDRAW: 'Unidades que salen',
  ADJUST: 'Cantidad contada (lo que hay físicamente)',
};

export const DEFAULT_REASON: Record<MovementKind, string> = {
  RECEIVE: 'Compra a proveedor',
  WITHDRAW: 'Venta',
  ADJUST: 'Conteo de inventario',
};

export const REJECT_LABELS: Record<string, string> = {
  INSUFFICIENT_STOCK: 'No hay stock suficiente disponible',
  BELOW_RESERVED: 'El conteo es menor que lo ya reservado',
  NO_CHANGE: 'El conteo es igual al stock actual: no hay nada que ajustar',
  PROCESSING_FAILED: 'No se pudo procesar. Inténtalo de nuevo',
};

export const rejectLabel = (reason: string | null): string =>
  (reason && REJECT_LABELS[reason]) || 'El movimiento fue rechazado';

// Clave que identifica UN intento: si se reenvía (doble toque, reintento de red) no se aplica dos veces.
export const newIdempotencyKey = (): string => `adm-${crypto.randomUUID()}`;

interface WaitOptions {
  fetchCommand: (id: string) => Promise<StockCommand>;
  sleep?: (ms: number) => Promise<void>;
  intervalMs?: number;
  timeoutMs?: number;
}

const realSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Consulta el comando hasta que llegue a un estado final. Devuelve null si sigue en cola al agotar el tiempo.
export async function waitForCommand(id: string, options: WaitOptions): Promise<StockCommand | null> {
  const { fetchCommand, sleep = realSleep, intervalMs = 750, timeoutMs = 30_000 } = options;
  for (let waited = 0; waited <= timeoutMs; waited += intervalMs) {
    const command = await fetchCommand(id);
    if (command.status !== 'PENDING') return command;
    await sleep(intervalMs);
  }
  return null;
}

export const fetchCommand = (id: string): Promise<StockCommand> => api<StockCommand>('GET', `inventory/commands/${id}`);

interface SendInput {
  variantId: string;
  type: MovementKind;
  units: number;
  reason: string;
  key: string;
}

// Encola el movimiento (202) con su clave de idempotencia y devuelve el comando aceptado.
export const sendMovement = ({ key, ...body }: SendInput): Promise<StockCommand> =>
  api<StockCommand>('POST', 'inventory/commands', body, { 'Idempotency-Key': key });
