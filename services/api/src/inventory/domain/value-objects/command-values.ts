import { InvalidCommandTypeError } from '../errors/inventory.errors.js';

// Tipos de movimiento: ingreso de mercadería, salida y ajuste por conteo.
export const COMMAND_TYPES = ['RECEIVE', 'WITHDRAW', 'ADJUST'] as const;
export type CommandType = (typeof COMMAND_TYPES)[number];

export function parseCommandType(raw: string): CommandType {
  const found = COMMAND_TYPES.find((type) => type === raw.trim().toUpperCase());
  if (!found) throw new InvalidCommandTypeError(raw);
  return found;
}

// Máquina de estados del comando: PENDING → APPLIED | REJECTED. Los dos finales no cambian.
export const COMMAND_STATUSES = ['PENDING', 'APPLIED', 'REJECTED'] as const;
export type CommandStatus = (typeof COMMAND_STATUSES)[number];

// Motivos por los que un comando queda REJECTED.
export const REJECT_REASONS = [
  'INSUFFICIENT_STOCK',
  'BELOW_RESERVED',
  'NO_CHANGE',
  'PROCESSING_FAILED',
] as const;
export type RejectReason = (typeof REJECT_REASONS)[number];

// Reintentos de procesamiento: máximo de intentos y espera creciente entre ellos.
export const RETRY_POLICY = {
  maxAttempts: 5,
  backoffMs: (attempt: number): number => 500 * 2 ** (attempt - 1),
} as const;
