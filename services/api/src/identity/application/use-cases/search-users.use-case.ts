import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { USERS_REPOSITORY, type UsersRepository } from '../../domain/users.repository.port.js';
import { SearchUsersQuery, type UserSummary } from '../dtos/assign-roles.dto.js';

// Busca usuarios por parte del nombre o del correo (lo usa el comando de asignación de roles).
@Injectable()
export class SearchUsersUseCase implements UseCase<SearchUsersQuery, UserSummary[]> {
  constructor(@Inject(USERS_REPOSITORY) private readonly users: UsersRepository) {}

  async execute(query: SearchUsersQuery): Promise<UserSummary[]> {
    if (query.term.trim().length === 0) return [];
    const found = await this.users.search(query.term, query.limit);
    return found.map((user) => ({
      id: user.id.value,
      email: user.email.value,
      name: user.name.value,
      roles: user.roles.map((role) => role.value),
    }));
  }
}
