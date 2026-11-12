import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from '../../../shared/domain/errors/domain.error.js';

export class InvalidTypeCodeError extends ValidationError {
  constructor(raw: string) {
    super(
      `"${raw}" no es un código de tipo válido (mayúsculas, números y _, de 2 a 30 caracteres)`
    );
  }
}

export class InvalidTypeNameError extends ValidationError {
  constructor() {
    super('El nombre del tipo debe tener entre 3 y 60 caracteres');
  }
}

export class MovementTypeNotFoundError extends NotFoundError {
  constructor() {
    super('El tipo de movimiento no existe');
  }
}

export class MovementTypeInactiveError extends ValidationError {
  constructor() {
    super('El tipo de movimiento está desactivado y no admite movimientos nuevos');
  }
}

export class MovementTypeKindMismatchError extends ValidationError {
  constructor() {
    super('El tipo de movimiento no corresponde a esa clase (ingreso, retiro o ajuste)');
  }
}

export class MovementTypeCodeTakenError extends ConflictError {
  constructor() {
    super('Ya existe un tipo de movimiento con ese código');
  }
}

export class SystemTypeProtectedError extends ConflictError {
  constructor() {
    super('Los tipos de sistema no se pueden desactivar');
  }
}
