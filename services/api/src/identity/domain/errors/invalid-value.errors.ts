import { ValidationError } from '../../../shared/domain/errors/domain.error.js';

export class InvalidEmailError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no es un correo electrónico válido`);
  }
}

export class InvalidRoleError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no es un rol válido`);
  }
}

export class InvalidUserIdError extends ValidationError {
  constructor(raw: string) {
    super(`"${raw}" no es un identificador de usuario válido`);
  }
}

export class InvalidPersonNameError extends ValidationError {
  constructor() {
    super('El nombre debe tener entre 1 y 100 caracteres');
  }
}

export class InvalidPasswordHashError extends ValidationError {
  constructor() {
    super('El hash de contraseña no puede estar vacío');
  }
}
