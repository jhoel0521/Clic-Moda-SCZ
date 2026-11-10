import { UnauthenticatedError } from '../../../shared/domain/errors/domain.error.js';

// Mensaje único para correo desconocido, contraseña errónea o cuenta sin acceso: así la respuesta
// no revela qué correos existen.
export class InvalidCredentialsError extends UnauthenticatedError {
  constructor() {
    super('Credenciales inválidas');
  }
}
