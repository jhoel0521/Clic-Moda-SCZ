import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.error.js';

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

export class MediaNotFoundError extends NotFoundError {
  constructor() {
    super('La imagen no existe');
  }
}

export class UnsupportedImageError extends ValidationError {
  constructor() {
    super('El archivo no es una imagen JPEG, PNG o WebP válida');
  }
}

export class ImageTooHeavyError extends ValidationError {
  constructor(maxMb: number) {
    super(`La imagen pesa más de ${String(maxMb)} MB`);
  }
}

export class ImageTooLargeError extends ValidationError {
  constructor(maxMegapixels: number) {
    super(`La imagen tiene más de ${String(maxMegapixels)} megapíxeles`);
  }
}

export class ImageTooSmallError extends ValidationError {
  constructor(minSide: number) {
    super(`El lado corto de la imagen debe medir al menos ${String(minSide)} px`);
  }
}
