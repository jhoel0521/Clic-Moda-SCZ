import type { MigrationInterface, QueryRunner } from 'typeorm';

// Slug estable y único por producto. Los productos existentes lo reciben AQUÍ, en TypeScript (Postgres no
// tiene `unaccent`), en orden de alta para que el resultado sea determinista, con sufijo -2, -3… si el nombre
// se repite. Una migración no puede importar código del proyecto (las pruebas la cargan como .ts nativo), así
// que repite la regla de `Slug.fromText` / `Slug.withSuffix` del dominio; `add-product-slug.migration.spec.ts`
// comprueba que ambas dan lo mismo.
const MAX_SLUG = 80;

const baseSlug = (name: string): string => {
  const value = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG)
    .replace(/-+$/g, '');
  return value || 'producto';
};

const withSuffix = (slug: string, n: number): string => {
  const tail = `-${String(n)}`;
  return `${slug.slice(0, MAX_SLUG - tail.length).replace(/-+$/g, '')}${tail}`;
};

function nextFree(base: string, used: Set<string>): string {
  if (!used.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = withSuffix(base, n);
    if (!used.has(candidate)) return candidate;
  }
}

export class AddProductSlug1794700000001 implements MigrationInterface {
  name = 'AddProductSlug1794700000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "products" ADD "slug" character varying(80)`);
    const rows: { id: string; name: string }[] = await queryRunner.query(
      `SELECT "id", "name" FROM "products" ORDER BY "created_at", "id"`
    );
    const used = new Set<string>();
    for (const row of rows) {
      const slug = nextFree(baseSlug(row.name), used);
      used.add(slug);
      await queryRunner.query(`UPDATE "products" SET "slug" = $1 WHERE "id" = $2`, [slug, row.id]);
    }
    await queryRunner.query(`ALTER TABLE "products" ALTER COLUMN "slug" SET NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "UQ_products_slug" ON "products" ("slug")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "UQ_products_slug"`);
    await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "slug"`);
  }
}
