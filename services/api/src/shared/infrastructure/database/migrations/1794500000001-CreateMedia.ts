import type { MigrationInterface, QueryRunner } from 'typeorm';

const UP = [
  `CREATE TABLE "media_assets" (
        "id" uuid NOT NULL,
        "alt" text NOT NULL,
        "focal_x" double precision NOT NULL DEFAULT 0.5,
        "focal_y" double precision NOT NULL DEFAULT 0.5,
        "fit" text NOT NULL DEFAULT 'cover',
        "background" text NOT NULL DEFAULT '#ffffff',
        "width" integer NOT NULL,
        "height" integer NOT NULL,
        "master_mime" text NOT NULL,
        "revision" integer NOT NULL DEFAULT 1,
        "published" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_assets" PRIMARY KEY ("id"),
        CONSTRAINT "CK_media_assets_alt_length" CHECK (char_length("alt") BETWEEN 1 AND 125),
        CONSTRAINT "CK_media_assets_focal" CHECK ("focal_x" BETWEEN 0 AND 1 AND "focal_y" BETWEEN 0 AND 1),
        CONSTRAINT "CK_media_assets_fit" CHECK ("fit" IN ('cover', 'contain')),
        CONSTRAINT "CK_media_assets_revision" CHECK ("revision" >= 1)
      )`,
  `CREATE TABLE "media_variants" (
        "asset_id" uuid NOT NULL,
        "format" text NOT NULL,
        "revision" integer NOT NULL,
        "width" integer NOT NULL,
        "height" integer NOT NULL,
        "bytes" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_media_variants" PRIMARY KEY ("asset_id", "format", "revision"),
        CONSTRAINT "FK_media_variants_asset" FOREIGN KEY ("asset_id")
          REFERENCES "media_assets" ("id") ON DELETE CASCADE
      )`,
  `CREATE INDEX "IDX_media_variants_created_at" ON "media_variants" ("created_at")`,
];

const DOWN = [`DROP TABLE "media_variants"`, `DROP TABLE "media_assets"`];

export class CreateMedia1794500000001 implements MigrationInterface {
  name = 'CreateMedia1794500000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
