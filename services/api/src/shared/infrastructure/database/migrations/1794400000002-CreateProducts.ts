import type { MigrationInterface, QueryRunner } from 'typeorm';

const UP = [
  `CREATE TABLE "products" (
        "id" uuid NOT NULL,
        "category_id" uuid NOT NULL,
        "name" character varying(120) NOT NULL,
        "description" character varying(2000),
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products" PRIMARY KEY ("id"),
        CONSTRAINT "FK_products_category" FOREIGN KEY ("category_id")
          REFERENCES "categories"("id") ON DELETE RESTRICT
      )`,
  `CREATE INDEX "IDX_products_category" ON "products" ("category_id")`,
  `CREATE TABLE "product_variants" (
        "id" uuid NOT NULL,
        "product_id" uuid NOT NULL,
        "sku" citext NOT NULL,
        "size" character varying(20) NOT NULL,
        "color" character varying(30),
        "price_cents" integer NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_product_variants" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_product_variants_sku" UNIQUE ("sku"),
        CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("product_id")
          REFERENCES "products"("id") ON DELETE CASCADE,
        CONSTRAINT "CK_product_variants_price" CHECK ("price_cents" > 0 AND "price_cents" <= 10000000)
      )`,
  `CREATE UNIQUE INDEX "UQ_product_variants_size_color" ON "product_variants" ("product_id", "size", COALESCE("color", ''))`,
];

const DOWN = [`DROP TABLE "product_variants"`, `DROP TABLE "products"`];

export class CreateProducts1794400000002 implements MigrationInterface {
  name = 'CreateProducts1794400000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
