import { DataSource } from 'typeorm';
import { envSchema } from '../../src/shared/infrastructure/config/env.schema.js';
import { buildDataSourceOptions } from '../../src/shared/infrastructure/database/database.config.js';
import { assertTestDatabase, reseedMovementTypes } from './db.js';
import { useTestDatabase } from './test-db.js';

// Se ejecuta una vez antes de todas las e2e: deja la base de pruebas con las migraciones aplicadas.
// Las migraciones que comprueban datos (p. ej. el saldo de cada movimiento contra el stock) no deben
// tropezar con restos de la corrida anterior: se vacían las tablas ya creadas antes de migrar.
async function emptyTablesBeforeMigrating(dataSource: DataSource): Promise<void> {
  await assertTestDatabase(dataSource);
  const rows: { tablename: string }[] = await dataSource.query(
    "select tablename from pg_tables where schemaname = 'public' and tablename <> 'migrations'"
  );
  if (rows.length === 0) return;
  const tables = rows.map((row) => `"${row.tablename}"`).join(', ');
  await dataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
}

// Los tipos con los que nace el sistema los siembra la migración; si el vaciado previo los borró (la tabla
// ya existía), se vuelven a insertar.
async function reseedMovementTypesIfEmpty(dataSource: DataSource): Promise<void> {
  const [{ total }] = await dataSource.query('select count(*)::int as total from movement_types');
  if (total === 0) await reseedMovementTypes(dataSource);
}

export default async function setup(): Promise<void> {
  useTestDatabase();
  const dataSource = new DataSource(buildDataSourceOptions(envSchema.parse(process.env)));
  await dataSource.initialize();
  await emptyTablesBeforeMigrating(dataSource);
  await dataSource.runMigrations();
  await reseedMovementTypesIfEmpty(dataSource);
  await dataSource.destroy();
}
