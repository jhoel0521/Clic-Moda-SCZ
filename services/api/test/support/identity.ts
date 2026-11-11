import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  PASSWORD_HASHER,
  type PasswordHasherPort,
} from '../../src/identity/application/ports/password-hasher.port.js';
import { User } from '../../src/identity/domain/entities/user.entity.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../../src/identity/domain/users.repository.port.js';
import { Email } from '../../src/identity/domain/value-objects/email.vo.js';
import { PersonName } from '../../src/identity/domain/value-objects/person-name.vo.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { truncateAll } from './db.js';

export const STAFF_PASSWORD = 'clave-segura-123';

export async function resetDatabase(app: INestApplication): Promise<void> {
  await truncateAll(app.get(DataSource));
}

// Crea un usuario del personal con los roles dados y la contraseña STAFF_PASSWORD.
export async function seedStaff(
  app: INestApplication,
  email: string,
  roles: readonly Role[]
): Promise<User> {
  const hasher = app.get<PasswordHasherPort>(PASSWORD_HASHER);
  const user = User.create({
    email: Email.of(email),
    name: PersonName.of(email.split('@')[0]),
    passwordHash: await hasher.hash(STAFF_PASSWORD),
  });
  user.assignRoles(roles);
  await app.get<UsersRepository>(USERS_REPOSITORY).save(user);
  return user;
}
