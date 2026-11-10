import { z } from 'zod';
import { ValidationError } from '../../../shared/domain/errors/domain.error.js';
import type {
  EnqueueResult,
  MovementPage,
  QueueStatusResult,
  StockCommandResult,
  StockPage,
} from '../../application/dtos/stock.dtos.js';

// DTOs de petición HTTP: único lugar donde se valida el formato de transporte.
export const enqueueSchema = z.object({
  variantId: z.string().max(60),
  type: z.enum(['RECEIVE', 'WITHDRAW', 'ADJUST']),
  units: z.number().int(),
  reason: z.string().max(500),
});
export type EnqueueDto = z.infer<typeof enqueueSchema>;

export const settingsSchema = z.object({
  location: z.string().max(100).nullable(),
  reorderLevel: z.number().int(),
});
export type SettingsDto = z.infer<typeof settingsSchema>;

const paging = {
  page: z.coerce.number().int().default(1),
  pageSize: z.coerce.number().int().default(20),
};

export const stockQuerySchema = z.object({
  ...paging,
  text: z.string().max(100).optional(),
  soldOut: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  byProduct: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export type StockQueryDto = z.infer<typeof stockQuerySchema>;

export const movementsQuerySchema = z.object({
  ...paging,
  type: z.string().max(20).optional(),
  // Fechas ISO como texto (un Date no se puede describir en la documentación OpenAPI); se convierten abajo.
  from: z.string().max(40).optional(),
  to: z.string().max(40).optional(),
});
export type MovementsQueryDto = z.infer<typeof movementsQuerySchema>;

// DTOs de respuesta HTTP (mappers aplicación -> HTTP).
export type CommandResponseDto = StockCommandResult;
export const toCommandResponse = (result: StockCommandResult): CommandResponseDto => ({
  ...result,
});
export const toEnqueueResponse = (result: EnqueueResult): CommandResponseDto =>
  toCommandResponse(result.command);

export type StockPageResponseDto = StockPage;
export const toStockPageResponse = (page: StockPage): StockPageResponseDto => ({ ...page });

export type MovementPageResponseDto = MovementPage;
export const toMovementPageResponse = (page: MovementPage): MovementPageResponseDto => ({
  ...page,
});

export type QueueResponseDto = QueueStatusResult;
export const toQueueResponse = (status: QueueStatusResult): QueueResponseDto => ({ ...status });

// Convierte una fecha ISO recibida como texto; una fecha inválida es un error de validación (400).
export function parseDate(raw: string | undefined): Date | undefined {
  if (raw === undefined) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) throw new ValidationError(`Fecha inválida: ${raw}`);
  return date;
}
