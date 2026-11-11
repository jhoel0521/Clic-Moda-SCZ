import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import {
  ROLE_EVENTS_REPOSITORY,
  type RoleEventsRepository,
} from '../../src/identity/domain/role-events.repository.port.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../../src/identity/domain/users.repository.port.js';
import { roleEventsRepositoryContract } from '../../src/identity/testing/role-events-repository.contract.js';
import { truncateAll } from '../support/db.js';

describe('TypeOrmRoleEventsRepository (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // La MISMA suite que corre contra el fake, ahora contra Postgres: incluye la atomicidad real.
  roleEventsRepositoryContract('TypeORM + Postgres', async () => {
    await truncateAll(moduleRef.get(DataSource));
    return {
      users: moduleRef.get<UsersRepository>(USERS_REPOSITORY),
      events: moduleRef.get<RoleEventsRepository>(ROLE_EVENTS_REPOSITORY),
    };
  });
});
