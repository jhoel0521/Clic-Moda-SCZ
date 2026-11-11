import type { MigrationInterface, QueryRunner } from 'typeorm';

// Fotos de un producto: referencia a la imagen del módulo de imágenes y posición (0 = principal). Sin clave
// foránea hacia `media_assets`: borrar una imagen no falla; el lector omite las que ya no existen.
const UP = [
  `CREATE TABLE "product_photos" (
        "product_id" uuid NOT NULL,
        "position" smallint NOT NULL,
        "media_id" uuid NOT NULL,
        CONSTRAINT "PK_product_photos" PRIMARY KEY ("product_id", "position"),
        CONSTRAINT "UQ_product_photos_media" UNIQUE ("product_id", "media_id"),
        CONSTRAINT "CK_product_photos_position" CHECK ("position" BETWEEN 0 AND 7),
        CONSTRAINT "FK_product_photos_product" FOREIGN KEY ("product_id")
          REFERENCES "products" ("id") ON DELETE CASCADE
      )`,
  `CREATE INDEX "IDX_product_photos_media" ON "product_photos" ("media_id")`,
];

const DOWN = [`DROP TABLE "product_photos"`];

export class CreateProductPhotos1794700000002 implements MigrationInterface {
  name = 'CreateProductPhotos1794700000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
