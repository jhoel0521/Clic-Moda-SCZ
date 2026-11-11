import type { DataSource } from 'typeorm';

async function assertTestDatabase(dataSource: DataSource): Promise<void> {
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
}
