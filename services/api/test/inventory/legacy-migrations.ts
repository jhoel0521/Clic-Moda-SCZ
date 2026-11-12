import { randomUUID } from 'node:crypto';
import { DataSource } from 'typeorm';
import { envSchema } from '../../src/shared/infrastructure/config/env.schema.js';
import { buildDataSourceOptions } from '../../src/shared/infrastructure/database/database.config.js';
import { truncateAll } from '../support/db.js';
import { insertVariant } from './inventory-sql.js';

export const newDataSource = async (): Promise<DataSource> => {
  const db = new DataSource(buildDataSourceOptions(envSchema.parse(process.env)));
  await db.initialize();
  return db;
};

// Los tests de migraciones usan el ejecutor REAL de TypeORM (deshacer y volver a aplicar): así la tabla
// `migrations` siempre queda coherente con el esquema, incluso si una prueba falla a mitad.
// Se deshace de la última hacia atrás hasta que la migración indicada deja de estar aplicada (así el test
// no depende de cuántas migraciones posteriores existan).
export async function undoUntil(db: DataSource, name: string): Promise<void> {
  const applied = async (): Promise<boolean> =>
    (await db.query('SELECT 1 FROM migrations WHERE name = $1', [name])).length > 0;
  while (await applied()) await db.undoLastMigration();
}

export const restoreMigrations = async (db: DataSource): Promise<void> => {
  await db.runMigrations();
};

export async function legacyVariant(db: DataSource): Promise<string> {
  await truncateAll(db);
  return (await insertVariant(db, { sku: 'OLD-1', productName: 'Antiguo' })).value;
}

// Un comando aplicado y su movimiento con la forma ANTERIOR a los tipos (sin `type_code`) o, con
// `withTypeCode`, anterior solo al saldo (con `type_code`, sin `balance_after`).
export async function legacyPair(
  db: DataSource,
  variantId: string,
  [type, delta]: readonly [string, number],
  withTypeCode: boolean
): Promise<void> {
  const commandId = randomUUID();
  const [column, value] = withTypeCode ? [', type_code', ', $3'] : ['', ''];
  await db.query(
    `INSERT INTO stock_commands (id, variant_id, type, quantity, reason, operator, request_hash, status, resolved_at${column})
     VALUES ($1, $2, $3, 1, 'Antiguo', 'u-1', repeat('a', 64), 'APPLIED', now()${value})`,
    [commandId, variantId, type]
  );
  const [movementColumn, movementValue] = withTypeCode ? [', type_code', ', $4'] : ['', ''];
  await db.query(
    `INSERT INTO stock_movements (id, variant_id, command_id, type, delta, reason, operator${movementColumn})
     VALUES ($1, $2, $3, $4, $5, 'Antiguo', 'u-1'${movementValue})`,
    [randomUUID(), variantId, commandId, type, delta]
  );
}
