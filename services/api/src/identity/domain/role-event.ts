import { randomUUID } from 'node:crypto';
import type { Role } from './value-objects/role.vo.js';
import type { UserId } from './value-objects/user-id.vo.js';

// Registro de auditoría de un cambio de roles.
export interface RoleEvent {
  readonly id: string;
  readonly userId: UserId;
  readonly previousRoles: readonly Role[];
  readonly newRoles: readonly Role[];
  // Quién ejecutó el cambio (usuario del sistema operativo en el comando).
  readonly operator: string;
  readonly occurredAt: Date;
}

export function createRoleEvent(input: Omit<RoleEvent, 'id' | 'occurredAt'>, at: Date): RoleEvent {
  return { ...input, id: randomUUID(), occurredAt: at };
}
