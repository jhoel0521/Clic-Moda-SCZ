import type { User } from './entities/user.entity.js';
import type { RoleEvent } from './role-event.js';
import type { UserId } from './value-objects/user-id.vo.js';

// Puerto de repositorio (dominio). El cambio de roles y su registro son ATÓMICOS: o se guardan los
// dos o ninguno.
export interface RoleEventsRepository {
  // Guarda el usuario con sus nuevos roles y el evento, en una sola transacción. Falla (y no cambia
  // nada) si `event.userId` no corresponde a un usuario existente.
  applyChange(user: User, event: RoleEvent): Promise<void>;
  // Eventos del usuario, el más reciente primero.
  listByUser(userId: UserId): Promise<RoleEvent[]>;
}

export const ROLE_EVENTS_REPOSITORY = Symbol('RoleEventsRepository');
