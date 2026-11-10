import { z } from 'zod';
import type { CategoryResult } from '../../application/dtos/category.dtos.js';

// DTO de petición HTTP: único lugar donde se valida el formato de transporte.
export const categoryRequestSchema = z.object({
  name: z.string().max(200),
});
export type CategoryRequestDto = z.infer<typeof categoryRequestSchema>;

// DTO de respuesta HTTP.
export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  productCount: number;
}

// Mapper aplicación -> HTTP.
export const toCategoryResponse = (result: CategoryResult): CategoryResponseDto => ({
  id: result.id,
  name: result.name,
  slug: result.slug,
  active: result.active,
  productCount: result.productCount,
});
