import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../shared/domain/errors/domain.error.js';

export class InvalidQuantityError extends ValidationError {
  constructor(detail: string) {
    super(`Cantidad inválida: ${detail}`);
  }
}

export class InvalidReasonError extends ValidationError {
  constructor() {
    super('El motivo debe tener entre 3 y 200 caracteres');
  }
}

export class InvalidIdempotencyKeyError extends ValidationError {
  constructor() {
    super('La clave de idempotencia debe tener entre 8 y 64 caracteres (letras, números, . _ : -)');
  }
}

export class InvalidOperatorError extends ValidationError {
  constructor() {
    super('El operador debe tener entre 1 y 100 caracteres');
  }
}

export class InvalidLocationError extends ValidationError {
  constructor() {
    super('La ubicación no puede superar los 40 caracteres');
  }
}

export class InvalidReorderLevelError extends ValidationError {
  constructor() {
    super('El umbral de reposición debe ser un entero entre 0 y 1000000');
  }
}

export class InvalidInventoryIdError extends ValidationError {
  constructor(kind: string, raw: string) {
    super(`"${raw}" no es un identificador de ${kind} válido`);
  }
}

export class InvalidCommandTypeError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no es un tipo de movimiento válido (RECEIVE, WITHDRAW o ADJUST)`);
  }
}

export class StockInvariantError extends ValidationError {
  constructor(detail: string) {
    super(`El stock no puede quedar así: ${detail}`);
  }
}

export class IllegalCommandTransitionError extends ConflictError {
  constructor(from: string, to: string) {
    super(`Un comando ${from} no puede pasar a ${to}`);
  }
}

export class IdempotencyConflictError extends ConflictError {
  constructor() {
    super('Esa clave de idempotencia ya se usó con un contenido distinto');
  }
}

export class CommandNotFoundError extends NotFoundError {
  constructor() {
    super('El comando no existe');
  }
}

export class VariantUnavailableError extends NotFoundError {
  constructor() {
    super('La variante no existe');
  }
}

export class VariantInactiveError extends ConflictError {
  constructor() {
    super('La variante está inactiva y no admite movimientos de stock');
  }
}
