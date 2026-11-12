import type { MigrationInterface, QueryRunner } from 'typeorm';

// Cada comando y cada movimiento llevan el código de su tipo (el motivo). `type` sigue siendo la clase
// (RECEIVE, WITHDRAW, ADJUST) y no se toca; lo existente queda con el tipo de sistema de su clase (código
// igual a la clase). `stock_movements` es inmutable por trigger: se deshabilita SOLO para este relleno y se
// vuelve a habilitar dentro de la misma transacción de la migración.
const UP = [
  `ALTER TABLE "stock_commands" ADD COLUMN "type_code" character varying(30)`,
  `ALTER TABLE "stock_movements" ADD COLUMN "type_code" character varying(30)`,
  `UPDATE "stock_commands" SET "type_code" = "type"`,
  `ALTER TABLE "stock_movements" DISABLE TRIGGER "TR_stock_movements_immutable"`,
  `UPDATE "stock_movements" SET "type_code" = "type"`,
  `ALTER TABLE "stock_movements" ENABLE TRIGGER "TR_stock_movements_immutable"`,
  `ALTER TABLE "stock_commands" ALTER COLUMN "type_code" SET NOT NULL`,
  `ALTER TABLE "stock_movements" ALTER COLUMN "type_code" SET NOT NULL`,
  `ALTER TABLE "stock_commands" ADD CONSTRAINT "FK_stock_commands_type_code"
     FOREIGN KEY ("type_code") REFERENCES "movement_types" ("code") ON DELETE RESTRICT`,
  `ALTER TABLE "stock_movements" ADD CONSTRAINT "FK_stock_movements_type_code"
     FOREIGN KEY ("type_code") REFERENCES "movement_types" ("code") ON DELETE RESTRICT`,
  `CREATE INDEX "IDX_stock_movements_type" ON "stock_movements" ("variant_id", "type_code", "occurred_at" DESC)`,
];

const DOWN = [
  `DROP INDEX "IDX_stock_movements_type"`,
  `ALTER TABLE "stock_movements" DROP CONSTRAINT "FK_stock_movements_type_code"`,
  `ALTER TABLE "stock_commands" DROP CONSTRAINT "FK_stock_commands_type_code"`,
  `ALTER TABLE "stock_movements" DROP COLUMN "type_code"`,
  `ALTER TABLE "stock_commands" DROP COLUMN "type_code"`,
];

export class AddTypeCodeToStock1794800000002 implements MigrationInterface {
  name = 'AddTypeCodeToStock1794800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
