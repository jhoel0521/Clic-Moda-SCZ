import { ValidationError } from '../../../shared/domain/errors/domain.error.js';

export class InvalidMediaIdError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no es un identificador de imagen válido`);
  }
}

export class InvalidMediaFormatError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no es un formato de imagen conocido`);
  }
}

export class InvalidFocalPointError extends ValidationError {
  constructor() {
    super('El punto de enfoque debe tener x e y entre 0 y 1');
  }
}

export class InvalidFramingError extends ValidationError {
  constructor(detail: string) {
    super(`Encuadre inválido: ${detail}`);
  }
}

export class InvalidAltTextError extends ValidationError {
  constructor() {
    super('El texto alternativo debe tener entre 1 y 125 caracteres');
  }
}

export class InvalidImageDimensionsError extends ValidationError {
  constructor(detail: string) {
    super(`Medidas de imagen inválidas: ${detail}`);
  }
}

export class InvalidRevisionError extends ValidationError {
  constructor() {
    super('La revisión debe ser un entero mayor o igual a 1');
  }
}
