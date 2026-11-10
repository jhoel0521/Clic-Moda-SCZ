import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../shared/domain/errors/domain.error.js';

export class ProductWithoutVariantsError extends ValidationError {
  constructor() {
    super('Un producto necesita al menos una variante');
  }
}

export class InvalidDescriptionError extends ValidationError {
  constructor() {
    super('La descripción no puede superar los 2000 caracteres');
  }
}

export class DuplicateSkuError extends ConflictError {
  constructor(sku: string) {
    super(`El SKU ${sku} ya existe`);
  }
}

export class DuplicateVariantError extends ConflictError {
  constructor(size: string, color: string | null) {
    super(`El producto ya tiene una variante talla ${size}${color ? ` color ${color}` : ''}`);
  }
}

export class DuplicateCategoryError extends ConflictError {
  constructor(name: string) {
    super(`Ya existe una categoría llamada "${name}"`);
  }
}

export class CategoryInUseError extends ConflictError {
  constructor() {
    super('La categoría tiene productos y no se puede borrar');
  }
}

export class SkuLockedError extends ConflictError {
  constructor(sku: string) {
    super(`El SKU ${sku} ya tiene movimientos de inventario y no se puede cambiar`);
  }
}

export class CategoryNotFoundError extends NotFoundError {
  constructor() {
    super('La categoría no existe');
  }
}

export class ProductNotFoundError extends NotFoundError {
  constructor() {
    super('El producto no existe');
  }
}

export class VariantNotFoundError extends NotFoundError {
  constructor() {
    super('La variante no existe');
  }
}
