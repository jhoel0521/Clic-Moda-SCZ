import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { STORE_SETTINGS_REPOSITORY } from '../../src/settings/domain/store-settings.repository.port.js';
import { storeSettingsRepositoryContract } from '../../src/settings/testing/store-settings-repository.contract.js';
import { truncateAll } from '../support/db.js';

describe('Configuración de la tienda sobre Postgres (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // La MISMA suite que corre contra el fake en memoria, ahora contra Postgres real.
  storeSettingsRepositoryContract('TypeORM + Postgres', async () => {
    await truncateAll(moduleRef.get(DataSource));
    return moduleRef.get(STORE_SETTINGS_REPOSITORY);
  });
});
