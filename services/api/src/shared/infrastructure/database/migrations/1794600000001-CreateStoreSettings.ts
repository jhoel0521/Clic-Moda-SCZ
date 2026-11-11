import type { MigrationInterface, QueryRunner } from 'typeorm';

// UNA sola fila (id = 1): la configuración de la tienda. Sin historial; el PUT la reemplaza completa.
const UP = [
  `CREATE TABLE "store_settings" (
        "id" smallint NOT NULL DEFAULT 1,
        "brand_name" text NOT NULL,
        "tagline" text NOT NULL,
        "brand_color" text NOT NULL,
        "logo_media_id" uuid NULL,
        "seo_title" text NOT NULL,
        "seo_description" text NOT NULL,
        "share_media_id" uuid NULL,
        "whatsapp" text NOT NULL,
        "address" text NOT NULL,
        "pickup_hours" text NOT NULL,
        "map_url" text NULL,
        "instagram_url" text NULL,
        "tiktok_url" text NULL,
        "facebook_url" text NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_store_settings" PRIMARY KEY ("id"),
        CONSTRAINT "CK_store_settings_single_row" CHECK ("id" = 1),
        CONSTRAINT "CK_store_settings_color" CHECK ("brand_color" ~ '^#[0-9a-f]{6}$'),
        CONSTRAINT "CK_store_settings_whatsapp" CHECK ("whatsapp" ~ '^[1-9][0-9]{9,14}$')
      )`,
];

const DOWN = [`DROP TABLE "store_settings"`];

export class CreateStoreSettings1794600000001 implements MigrationInterface {
  name = 'CreateStoreSettings1794600000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
