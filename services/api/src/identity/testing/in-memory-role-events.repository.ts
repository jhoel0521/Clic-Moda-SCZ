import { ConflictError } from '../../shared/domain/errors/domain.error.js';
import type { User } from '../domain/entities/user.entity.js';
import type { RoleEvent } from '../domain/role-event.js';
import type { RoleEventsRepository } from '../domain/role-events.repository.port.js';
import type { UsersRepository } from '../domain/users.repository.port.js';
import type { UserId } from '../domain/value-objects/user-id.vo.js';

// Fake en memoria. Reproduce la atomicidad de la implementación real: si el evento apunta a un
// usuario que no existe, NO se guarda ni el evento ni el cambio del usuario.
export class InMemoryRoleEventsRepository implements RoleEventsRepository {
  private readonly events: RoleEvent[] = [];

  constructor(private readonly users: UsersRepository) {}

  async applyChange(user: User, event: RoleEvent): Promise<void> {
    if (!(await this.users.findById(event.userId))) {
      throw new ConflictError('El evento apunta a un usuario inexistente');
    }
    await this.users.save(user);
    this.events.push(event);
  }

  async listByUser(userId: UserId): Promise<RoleEvent[]> {
    return this.events
      .filter((event) => event.userId.equals(userId))
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime());
  }
}
