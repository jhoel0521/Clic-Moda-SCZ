import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { envSchema } from '../../src/config/env.schema.js';
import { buildDataSourceOptions } from '../../src/database/database.config.js';
import { truncateAll } from './db.js';

const PROBE = 'create table if not exists harness_probe (id serial primary key, v text)';

async function bootDataSource(): Promise<DataSource> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const dataSource = moduleRef.get(DataSource);
  await dataSource.query(PROBE);
  return dataSource;
}

const count = async (dataSource: DataSource, table: string): Promise<number> => {
  const [{ n }] = await dataSource.query(`select count(*)::int as n from ${table}`);
  return n;
};

describe('truncateAll', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await bootDataSource();
  });

  afterAll(async () => {
    await dataSource.query('drop table if exists harness_probe');
    await dataSource.destroy();
  });

  it('vacía las tablas y reinicia los identificadores', async () => {
    await dataSource.query("insert into harness_probe (v) values ('a'), ('b')");
    await truncateAll(dataSource);

    const [{ id }] = await dataSource.query(
      "insert into harness_probe (v) values ('c') returning id"
    );
    expect(id).toBe(1);
  });

  it('conserva el historial de migraciones', async () => {
    await truncateAll(dataSource);

    expect(await count(dataSource, 'migrations')).toBeGreaterThan(0);
  });
});

describe('Salvaguarda de la base de desarrollo', () => {
  it('truncateAll se niega a operar sobre una base que no termina en _test', async () => {
    const env = envSchema.parse({ ...process.env, DB_NAME: 'clic_moda' });
    const devSource = new DataSource({ ...buildDataSourceOptions(env), migrations: [] });
    await devSource.initialize();

    await expect(truncateAll(devSource)).rejects.toThrow(/no es una base de pruebas/);
    await devSource.destroy();
  });
});
