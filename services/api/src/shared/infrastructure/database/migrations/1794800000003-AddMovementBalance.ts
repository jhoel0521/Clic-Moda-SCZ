import type { MigrationInterface, QueryRunner } from 'typeorm';

// Cada movimiento guarda las unidades físicas que quedaron DESPUÉS de aplicarlo (kardex). Lo existente se
// rellena con la suma acumulada de las variaciones en el orden de sus comandos (`seq`). `stock_movements`
// es inmutable por trigger: se deshabilita SOLO para este relleno y se vuelve a habilitar en la misma
// transacción. Antes de confirmar se comprueba que el último saldo de cada variante coincide con su stock
// actual; si no, la migración falla (y TypeORM la revierte entera) nombrando las variantes.
const BACKFILL = `
  UPDATE "stock_movements" m SET "balance_after" = running."balance"
  FROM (
    SELECT sm."id", SUM(sm."delta") OVER (PARTITION BY sm."variant_id" ORDER BY c."seq")::int AS "balance"
    FROM "stock_movements" sm JOIN "stock_commands" c ON c."id" = sm."command_id"
  ) running
  WHERE running."id" = m."id"`;

const MISMATCHES = `
  SELECT last."variant_id", last."balance_after" AS "history", COALESCE(l."on_hand", 0) AS "stock"
  FROM (
    SELECT DISTINCT ON (sm."variant_id") sm."variant_id", sm."balance_after"
    FROM "stock_movements" sm JOIN "stock_commands" c ON c."id" = sm."command_id"
    ORDER BY sm."variant_id", c."seq" DESC
  ) last
  LEFT JOIN "stock_levels" l ON l."variant_id" = last."variant_id"
  WHERE last."balance_after" <> COALESCE(l."on_hand", 0)`;

const DOWN = [
  `ALTER TABLE "stock_movements" DROP CONSTRAINT "CK_stock_movements_balance"`,
  `ALTER TABLE "stock_movements" DROP COLUMN "balance_after"`,
];

export class AddMovementBalance1794800000003 implements MigrationInterface {
  name = 'AddMovementBalance1794800000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "stock_movements" ADD COLUMN "balance_after" integer`);
    await queryRunner.query(
      `ALTER TABLE "stock_movements" DISABLE TRIGGER "TR_stock_movements_immutable"`
    );
    await queryRunner.query(BACKFILL);
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ENABLE TRIGGER "TR_stock_movements_immutable"`
    );
    await this.assertLedgerMatchesStock(queryRunner);
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ALTER COLUMN "balance_after" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "stock_movements" ADD CONSTRAINT "CK_stock_movements_balance" CHECK ("balance_after" >= 0)`
    );
  }

  private async assertLedgerMatchesStock(queryRunner: QueryRunner): Promise<void> {
    const rows: { variant_id: string; history: number; stock: number }[] =
      await queryRunner.query(MISMATCHES);
    if (rows.length === 0) return;
    const detail = rows
      .slice(0, 10)
      .map((row) => `${row.variant_id} (historial ${row.history}, stock ${row.stock})`)
      .join('; ');
    throw new Error(
      `El historial no coincide con el stock actual en ${rows.length} variante(s): ${detail}. ` +
        'No se cambió nada: corrige esas variantes y vuelve a ejecutar la migración.'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
