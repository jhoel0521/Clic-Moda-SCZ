import type { MigrationInterface, QueryRunner } from 'typeorm';

const UP = [
  `CREATE TABLE "stock_commands" (
        "id" uuid NOT NULL,
        "seq" bigint GENERATED ALWAYS AS IDENTITY,
        "variant_id" uuid NOT NULL,
        "type" character varying(10) NOT NULL,
        "quantity" integer NOT NULL,
        "reason" character varying(200) NOT NULL,
        "operator" text NOT NULL,
        "idempotency_key" character varying(64),
        "request_hash" character(64) NOT NULL,
        "status" character varying(10) NOT NULL DEFAULT 'PENDING',
        "reject_reason" character varying(40),
        "attempts" smallint NOT NULL DEFAULT 0,
        "available_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "accepted_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "resolved_at" TIMESTAMP WITH TIME ZONE,
        "movement_id" uuid,
        CONSTRAINT "PK_stock_commands" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_stock_commands_seq" UNIQUE ("seq"),
        CONSTRAINT "UQ_stock_commands_idempotency" UNIQUE ("idempotency_key"),
        CONSTRAINT "FK_stock_commands_variant" FOREIGN KEY ("variant_id")
          REFERENCES "product_variants"("id") ON DELETE RESTRICT,
        CONSTRAINT "CK_stock_commands_type" CHECK ("type" IN ('RECEIVE', 'WITHDRAW', 'ADJUST')),
        CONSTRAINT "CK_stock_commands_status" CHECK ("status" IN ('PENDING', 'APPLIED', 'REJECTED')),
        CONSTRAINT "CK_stock_commands_quantity" CHECK ("quantity" >= 0),
        CONSTRAINT "CK_stock_commands_resolved" CHECK (("status" = 'PENDING') = ("resolved_at" IS NULL))
      )`,
  `CREATE INDEX "IDX_stock_commands_pending" ON "stock_commands" ("variant_id", "seq") WHERE "status" = 'PENDING'`,
];

const DOWN = [`DROP TABLE "stock_commands"`];

export class CreateStockCommands1794400000003 implements MigrationInterface {
  name = 'CreateStockCommands1794400000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
