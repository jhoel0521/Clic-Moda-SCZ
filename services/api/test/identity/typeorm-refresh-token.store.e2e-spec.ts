import { authenticationStoreContract } from '@nestjs/authentication/testing';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { TypeOrmRefreshTokenStore } from '../../src/identity/infrastructure/persistence/typeorm-refresh-token.store.js';
import { truncateAll } from '../support/db.js';

describe('TypeOrmRefreshTokenStore: contrato oficial del paquete (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // La suite que el propio paquete exige a todo almacén, con los casos de concurrencia
  // (llamadas en paralelo sobre un mismo token) sobre el pool de conexiones real.
  const cases = authenticationStoreContract(
    async () => {
      const dataSource = moduleRef.get(DataSource);
      await truncateAll(dataSource);
      return { refreshTokens: new TypeOrmRefreshTokenStore(dataSource) };
    },
    { contracts: ['refreshTokens'], concurrent: true }
  );

  it.each(cases.map((contractCase) => [contractCase.name, contractCase] as const))(
    '%s',
    async (_name, contractCase) => {
      await contractCase.run();
    }
  );
});
