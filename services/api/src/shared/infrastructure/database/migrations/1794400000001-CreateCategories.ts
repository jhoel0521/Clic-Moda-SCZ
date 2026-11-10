import type { MigrationInterface, QueryRunner } from 'typeorm';

const UP = [
  `CREATE TABLE "categories" (
        "id" uuid NOT NULL,
        "name" citext NOT NULL,
        "slug" text NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "UQ_categories_slug" UNIQUE ("slug"),
        CONSTRAINT "CK_categories_name_length" CHECK (char_length("name") BETWEEN 2 AND 60)
      )`,
];

const DOWN = [`DROP TABLE "categories"`];

export class CreateCategories1794400000001 implements MigrationInterface {
  name = 'CreateCategories1794400000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
