import { LastManagerError } from './errors/last-manager.error.js';
import { Role } from './value-objects/role.vo.js';

export interface ManagerContinuityInput {
  previousRoles: readonly Role[];
  newRoles: readonly Role[];
  // Cuántos usuarios tienen hoy el rol de Gerente (incluido el que se modifica).
  managerCount: number;
}

const includesManager = (roles: readonly Role[]): boolean =>
  roles.some((role) => role.equals(Role.GERENTE));

// Invariante de dominio: el sistema nunca se queda sin ningún Gerente.
export function assertManagerContinuity(input: ManagerContinuityInput): void {
  const losesManager = includesManager(input.previousRoles) && !includesManager(input.newRoles);
  if (losesManager && input.managerCount <= 1) throw new LastManagerError();
}
