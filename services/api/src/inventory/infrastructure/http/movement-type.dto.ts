import { z } from 'zod';

// DTOs de petición HTTP de los tipos de movimiento: solo el formato de transporte; las reglas de
// negocio (nombre de 3 a 60, clase válida) las valida el dominio y salen como error por campo (422).
export const createTypeSchema = z.object({
  name: z.string().max(200),
  kind: z.string().max(20),
});
export type CreateTypeDto = z.infer<typeof createTypeSchema>;

export const patchTypeSchema = z
  .object({
    name: z.string().max(200).optional(),
    active: z.boolean().optional(),
  })
  .refine((body) => body.name !== undefined || body.active !== undefined, {
    message: 'Indica el nombre o el estado que quieres cambiar',
  });
export type PatchTypeDto = z.infer<typeof patchTypeSchema>;

export const listTypesQuerySchema = z.object({
  includeInactive: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export type ListTypesQueryDto = z.infer<typeof listTypesQuerySchema>;
