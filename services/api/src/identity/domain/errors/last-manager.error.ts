import { ConflictError } from '../../../shared/domain/errors/domain.error.js';

export class LastManagerError extends ConflictError {
  constructor() {
    super(
      'No se puede quitar el rol de Gerente al último Gerente: el sistema debe tener al menos uno'
    );
  }
}
