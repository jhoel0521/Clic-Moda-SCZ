import { z } from 'zod';
import {
  DEFAULT_PUBLIC_PAGE_SIZE,
  ListPublicCatalogQuery,
} from '../../application/dtos/public-catalog.dtos.js';

// Parámetros de la URL pública. El tamaño de página se acota a 48 en el caso de uso (pedir 500 no es un error).
const flag = z
  .enum(['true', '1', 'false', '0'])
  .optional()
  .transform((value) => value === 'true' || value === '1');

export const publicListSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(DEFAULT_PUBLIC_PAGE_SIZE),
  sort: z.enum(['new', 'price_asc', 'price_desc']).default('new'),
  available: flag,
  category: z.string().trim().max(80).optional(),
  size: z.string().trim().max(20).optional(),
  q: z.string().trim().max(100).optional(),
});
export type PublicListDto = z.infer<typeof publicListSchema>;

// Mapper HTTP -> aplicación.
export const toListQuery = (dto: PublicListDto): ListPublicCatalogQuery =>
  new ListPublicCatalogQuery(
    dto.page,
    dto.pageSize,
    dto.sort,
    dto.available,
    dto.category || undefined,
    dto.size || undefined,
    dto.q || undefined
  );
