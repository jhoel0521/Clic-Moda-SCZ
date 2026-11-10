import { DataSource } from 'typeorm';
import { envSchema } from '../../src/config/env.schema.js';
import { buildDataSourceOptions } from '../../src/database/database.config.js';
import { useTestDatabase } from './test-db.js';

// Se ejecuta una vez antes de todas las e2e: deja la base de pruebas con las migraciones aplicadas.
export default async function setup(): Promise<void> {
  useTestDatabase();
  const dataSource = new DataSource(buildDataSourceOptions(envSchema.parse(process.env)));
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
