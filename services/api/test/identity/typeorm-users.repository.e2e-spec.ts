import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { USERS_REPOSITORY } from '../../src/identity/domain/users.repository.port.js';
import { usersRepositoryContract } from '../../src/identity/testing/users-repository.contract.js';
import { truncateAll } from '../support/db.js';

describe('TypeOrmUsersRepository (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // La MISMA suite que corre contra el fake en memoria, ahora contra Postgres real.
  usersRepositoryContract('TypeORM + Postgres', async () => {
    await truncateAll(moduleRef.get(DataSource));
    return moduleRef.get(USERS_REPOSITORY);
  });
});
