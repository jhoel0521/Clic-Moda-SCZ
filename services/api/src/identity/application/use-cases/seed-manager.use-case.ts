import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { User } from '../../domain/entities/user.entity.js';
import { USERS_REPOSITORY, type UsersRepository } from '../../domain/users.repository.port.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { SeedManagerCommand, type SeedManagerResult } from '../dtos/seed-manager.dto.js';
import { PASSWORD_HASHER, type PasswordHasherPort } from '../ports/password-hasher.port.js';

// Crea el primer Gerente. Idempotente: si ya hay uno, no hace nada.
@Injectable()
export class SeedManagerUseCase implements UseCase<SeedManagerCommand, SeedManagerResult> {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort
  ) {}

  async execute(command: SeedManagerCommand): Promise<SeedManagerResult> {
    if ((await this.users.countWithRole(Role.GERENTE)) > 0) {
      return { created: false, email: null };
    }
    const manager = User.create({
      email: Email.of(command.email),
      name: PersonName.of(command.name),
      passwordHash: await this.hasher.hash(command.password),
    });
    manager.assignRoles([Role.GERENTE]);
    manager.markEmailVerified();
    await this.users.save(manager);
    return { created: true, email: manager.email.value };
  }
}
