import type { MigrationInterface, QueryRunner } from 'typeorm';

const UP = [
  `CREATE TABLE "stock_levels" (
        "variant_id" uuid NOT NULL,
        "on_hand" integer NOT NULL DEFAULT 0,
        "reserved" integer NOT NULL DEFAULT 0,
        "location" character varying(40),
        "reorder_level" integer NOT NULL DEFAULT 0,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_levels" PRIMARY KEY ("variant_id"),
        CONSTRAINT "FK_stock_levels_variant" FOREIGN KEY ("variant_id")
          REFERENCES "product_variants"("id") ON DELETE RESTRICT,
        CONSTRAINT "CK_stock_levels_on_hand" CHECK ("on_hand" >= 0),
        CONSTRAINT "CK_stock_levels_reserved" CHECK ("reserved" >= 0),
        CONSTRAINT "CK_stock_levels_reserved_le_on_hand" CHECK ("reserved" <= "on_hand"),
        CONSTRAINT "CK_stock_levels_reorder" CHECK ("reorder_level" >= 0)
      )`,
  `CREATE TABLE "stock_movements" (
        "id" uuid NOT NULL,
        "variant_id" uuid NOT NULL,
        "command_id" uuid NOT NULL,
        "type" character varying(10) NOT NULL,
        "delta" integer NOT NULL,
        "reason" character varying(200) NOT NULL,
        "operator" text NOT NULL,
        "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_stock_movements" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_stock_movements_command" UNIQUE ("command_id"),
        CONSTRAINT "FK_stock_movements_variant" FOREIGN KEY ("variant_id")
          REFERENCES "product_variants"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_stock_movements_command" FOREIGN KEY ("command_id")
          REFERENCES "stock_commands"("id") ON DELETE RESTRICT,
        CONSTRAINT "CK_stock_movements_type" CHECK ("type" IN ('RECEIVE', 'WITHDRAW', 'ADJUST')),
        CONSTRAINT "CK_stock_movements_delta" CHECK ("delta" <> 0)
      )`,
  `CREATE INDEX "IDX_stock_movements_variant" ON "stock_movements" ("variant_id", "occurred_at" DESC)`,
  `CREATE FUNCTION "stock_movements_immutable"() RETURNS trigger AS $$
       BEGIN RAISE EXCEPTION 'stock_movements es inmutable'; END; $$ LANGUAGE plpgsql`,
  `CREATE TRIGGER "TR_stock_movements_immutable" BEFORE UPDATE OR DELETE ON "stock_movements"
       FOR EACH ROW EXECUTE FUNCTION "stock_movements_immutable"()`,
];

const DOWN = [
  `DROP TRIGGER "TR_stock_movements_immutable" ON "stock_movements"`,
  `DROP FUNCTION "stock_movements_immutable"()`,
  `DROP TABLE "stock_movements"`,
  `DROP TABLE "stock_levels"`,
];

export class CreateStockTables1794400000004 implements MigrationInterface {
  name = 'CreateStockTables1794400000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
