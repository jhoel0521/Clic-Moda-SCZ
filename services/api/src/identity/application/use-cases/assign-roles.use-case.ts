import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { NotFoundError } from '../../../shared/domain/errors/domain.error.js';
import type { User } from '../../domain/entities/user.entity.js';
import { createRoleEvent } from '../../domain/role-event.js';
import {
  ROLE_EVENTS_REPOSITORY,
  type RoleEventsRepository,
} from '../../domain/role-events.repository.port.js';
import { assertManagerContinuity } from '../../domain/role-assignment.policy.js';
import { USERS_REPOSITORY, type UsersRepository } from '../../domain/users.repository.port.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { UserId } from '../../domain/value-objects/user-id.vo.js';
import { AssignRolesCommand, type AssignRolesResult } from '../dtos/assign-roles.dto.js';

const values = (roles: readonly Role[]): string[] => roles.map((role) => role.value);

// Reemplaza el conjunto de roles de un usuario, respetando que siempre quede un Gerente y dejando
// registro del cambio (atómico con el cambio).
@Injectable()
export class AssignRolesUseCase implements UseCase<AssignRolesCommand, AssignRolesResult> {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(ROLE_EVENTS_REPOSITORY) private readonly events: RoleEventsRepository
  ) {}

  async execute(command: AssignRolesCommand): Promise<AssignRolesResult> {
    const user = await this.findUser(command.userId);
    const newRoles = command.roles.map((raw) => Role.of(raw));
    const previousRoles = [...user.roles];

    assertManagerContinuity({
      previousRoles,
      newRoles,
      managerCount: await this.users.countWithRole(Role.GERENTE),
    });
    user.assignRoles(newRoles);
    const changed = values(previousRoles).join() !== values(user.roles).join();
    if (changed) {
      const event = createRoleEvent(
        { userId: user.id, previousRoles, newRoles: user.roles, operator: command.operator },
        new Date()
      );
      await this.events.applyChange(user, event);
    }
    return this.result(user, previousRoles, changed);
  }

  private async findUser(rawId: string): Promise<User> {
    const user = await this.users.findById(UserId.of(rawId));
    if (!user) throw new NotFoundError('Usuario no encontrado');
    return user;
  }

  private result(user: User, previous: readonly Role[], changed: boolean): AssignRolesResult {
    return {
      userId: user.id.value,
      email: user.email.value,
      previousRoles: values(previous),
      newRoles: values(user.roles),
      changed,
    };
  }
}
