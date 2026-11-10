import { ValidationError } from '../domain/errors/domain.error.js';

export const MAX_PAGE_SIZE = 100;

// Valida la paginación pedida por el cliente: página desde 1 y tamaño de 1 a 100.
export function assertPagination(page: number, pageSize: number): void {
  if (!Number.isInteger(page) || page < 1) throw new ValidationError('La página debe ser 1 o más');
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
    throw new ValidationError(`El tamaño de página debe estar entre 1 y ${MAX_PAGE_SIZE}`);
  }
}
