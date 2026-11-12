import type { DataSource } from 'typeorm';
import { SEED_TYPES } from '../../src/inventory/domain/movement-type-seed.js';

export async function assertTestDatabase(dataSource: DataSource): Promise<void> {
  const [row] = await dataSource.query('select current_database() as db');
  if (!String(row.db).endsWith('_test')) {
    throw new Error(`Se niega a limpiar "${row.db}": no es una base de pruebas (_test).`);
  }
}

// Vacía todas las tablas de aplicación entre casos (excepto el historial de migraciones).
export async function truncateAll(dataSource: DataSource): Promise<void> {
  await assertTestDatabase(dataSource);
  const rows: { tablename: string }[] = await dataSource.query(
    "select tablename from pg_tables where schemaname = 'public' and tablename <> 'migrations'"
  );
  if (!rows.length) return;
  const tables = rows.map((row) => `"${row.tablename}"`).join(', ');
  await dataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE`);
  await reseedMovementTypes(dataSource);
}

// Los tipos con los que nace el sistema son datos de referencia (los deja la migración): tras vaciar
// todo se vuelven a insertar, para que cada caso parta del mismo estado que una base recién migrada.
export async function reseedMovementTypes(dataSource: DataSource): Promise<void> {
  for (const [index, seed] of SEED_TYPES.entries()) {
    await dataSource.query(
      `INSERT INTO movement_types (code, name, kind, system, created_at)
       VALUES ($1, $2, $3, $4, now() + ($5 * interval '1 millisecond'))`,
      [seed.code, seed.name, seed.kind, seed.system, index]
    );
  }
}
