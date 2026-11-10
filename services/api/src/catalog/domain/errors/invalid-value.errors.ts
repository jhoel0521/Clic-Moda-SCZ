import { ValidationError } from '../../../shared/domain/errors/domain.error.js';

export class InvalidCategoryNameError extends ValidationError {
  constructor() {
    super('El nombre de la categoría debe tener entre 2 y 60 caracteres');
  }
}

export class InvalidSlugError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no se puede convertir en un identificador de URL válido`);
  }
}

export class InvalidProductNameError extends ValidationError {
  constructor() {
    super('El nombre del producto debe tener entre 2 y 120 caracteres');
  }
}

export class InvalidMoneyError extends ValidationError {
  constructor(detail: string) {
    super(`Precio inválido: ${detail}`);
  }
}

export class InvalidSkuError extends ValidationError {
  constructor(raw: string) {
    super(`El SKU "${raw}" debe tener de 3 a 40 caracteres: letras, números, guiones o puntos`);
  }
}

export class InvalidSizeError extends ValidationError {
  constructor(raw: string) {
    super(
      `La talla "${raw}" debe tener de 1 a 20 caracteres (letras, números, punto, coma, barra o guion)`
    );
  }
}

export class InvalidColorError extends ValidationError {
  constructor(raw: string) {
    super(`El color "${raw}" debe tener de 1 a 30 letras`);
  }
}

export class InvalidCatalogIdError extends ValidationError {
  constructor(kind: string, raw: string) {
    super(`"${raw}" no es un identificador de ${kind} válido`);
  }
}
