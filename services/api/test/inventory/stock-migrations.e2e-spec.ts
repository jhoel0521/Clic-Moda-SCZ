import type { DataSource } from 'typeorm';
import { insertVariant } from './inventory-sql.js';
import {
  legacyPair,
  legacyVariant,
  newDataSource,
  restoreMigrations,
  undoUntil,
} from './legacy-migrations.js';

let db: DataSource;

beforeAll(async () => {
  db = await newDataSource();
});

afterAll(async () => {
  await restoreMigrations(db);
  await db.destroy();
});

const HISTORY = [
  ['RECEIVE', 10],
  ['WITHDRAW', -3],
  ['ADJUST', -1],
] as const;

async function withLegacyHistory(withTypeCode: boolean, onHand: number): Promise<string> {
  const variant = await legacyVariant(db);
  for (const entry of HISTORY) await legacyPair(db, variant, entry, withTypeCode);
  await db.query('INSERT INTO stock_levels (variant_id, on_hand) VALUES ($1, $2)', [
    variant,
    onHand,
  ]);
  return variant;
}

describe('migración de los tipos con datos anteriores', () => {
  it('deja cada comando y movimiento con el tipo de sistema de su clase y el historial vuelve a ser inmutable', async () => {
    await undoUntil(db, 'AddTypeCodeToStock1794800000002'); // el esquema de antes de los tipos
    await withLegacyHistory(false, 6);

    await restoreMigrations(db);

    const rows = await db.query(
      `SELECT type, type_code FROM stock_commands UNION ALL SELECT type, type_code FROM stock_movements`
    );
    expect(rows).toHaveLength(6);
    expect(
      rows.every((row: { type: string; type_code: string }) => row.type === row.type_code)
    ).toBe(true);
    await expect(db.query('UPDATE stock_movements SET delta = delta + 1')).rejects.toThrow(
      'inmutable'
    );
  });
});

describe('migración del saldo con datos anteriores', () => {
  it('rellena el saldo acumulado por orden de comando cuando el historial coincide con el stock', async () => {
    await undoUntil(db, 'AddMovementBalance1794800000003'); // el esquema de antes del saldo
    await withLegacyHistory(true, 6);
    const other = (await insertVariant(db, { sku: 'OLD-2', productName: 'Otro' })).value;
    await legacyPair(db, other, ['RECEIVE', 4], true);
    await db.query('INSERT INTO stock_levels (variant_id, on_hand) VALUES ($1, 4)', [other]);

    await restoreMigrations(db);

    const rows = await db.query(
      `SELECT m.balance_after FROM stock_movements m JOIN stock_commands c ON c.id = m.command_id ORDER BY c.seq`
    );
    // Cada variante acumula por separado: la segunda empieza de cero y no continúa la suma de la primera.
    expect(rows.map((row: { balance_after: number }) => row.balance_after)).toEqual([10, 7, 6, 4]);
  });
});

describe('migración del saldo con un historial que no coincide', () => {
  it('falla nombrando la variante y no cambia nada; al corregir el stock se aplica', async () => {
    await undoUntil(db, 'AddMovementBalance1794800000003'); // el esquema de antes del saldo
    const variant = await withLegacyHistory(true, 99);

    await expect(restoreMigrations(db)).rejects.toThrow(variant);
    const columns = await db.query(
      `SELECT 1 FROM information_schema.columns WHERE table_name = 'stock_movements' AND column_name = 'balance_after'`
    );
    expect(columns).toHaveLength(0);
    await db.query('UPDATE stock_levels SET on_hand = 6');
    await restoreMigrations(db);
  });
});
