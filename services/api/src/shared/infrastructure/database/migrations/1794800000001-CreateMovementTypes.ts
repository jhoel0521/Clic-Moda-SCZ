import type { MigrationInterface, QueryRunner } from 'typeorm';

// Una migración no puede importar código del proyecto (las pruebas la cargan como .ts nativo), así que
// repite la lista de `SEED_TYPES` del dominio; `create-movement-types.migration.spec.ts` comprueba que
// ambas son iguales.
export const MIGRATION_SEED_TYPES = [
  ['RECEIVE', 'Ingreso', 'RECEIVE', true],
  ['WITHDRAW', 'Retiro', 'WITHDRAW', true],
  ['ADJUST', 'Ajuste', 'ADJUST', true],
  ['PURCHASE', 'Ingreso por compra', 'RECEIVE', false],
  ['CUSTOMER_RETURN', 'Devolución de cliente', 'RECEIVE', false],
  ['SALE', 'Venta', 'WITHDRAW', false],
  ['SHRINKAGE', 'Merma o daño', 'WITHDRAW', false],
  ['GIFT', 'Regalo o muestra', 'WITHDRAW', false],
  ['COUNT', 'Ajuste por conteo', 'ADJUST', false],
] as const;

// Tipos de movimiento como datos: el motivo de un cambio de stock. La clase (RECEIVE, WITHDRAW, ADJUST)
// decide cómo cambia el stock; el tipo solo lo explica. El código y la clase no cambian jamás y no se
// borra un tipo (un trigger lo impide): se desactiva. Los de sistema siempre están activos.
const UP = [
  `CREATE TABLE "movement_types" (
        "code" character varying(30) NOT NULL,
        "name" character varying(60) NOT NULL,
        "kind" character varying(10) NOT NULL,
        "active" boolean NOT NULL DEFAULT true,
        "system" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_movement_types" PRIMARY KEY ("code"),
        CONSTRAINT "CK_movement_types_code" CHECK ("code" ~ '^[A-Z0-9_]{2,30}$'),
        CONSTRAINT "CK_movement_types_name" CHECK (char_length("name") BETWEEN 3 AND 60),
        CONSTRAINT "CK_movement_types_kind" CHECK ("kind" IN ('RECEIVE', 'WITHDRAW', 'ADJUST')),
        CONSTRAINT "CK_movement_types_system_active" CHECK (NOT "system" OR "active")
      )`,
  `CREATE FUNCTION "movement_types_guard"() RETURNS trigger AS $$
       BEGIN
         IF TG_OP = 'DELETE' THEN RAISE EXCEPTION 'movement_types no se borra: se desactiva'; END IF;
         IF NEW."code" <> OLD."code" OR NEW."kind" <> OLD."kind" OR NEW."system" <> OLD."system" THEN
           RAISE EXCEPTION 'el codigo, la clase y el tipo de sistema no cambian';
         END IF;
         RETURN NEW;
       END; $$ LANGUAGE plpgsql`,
  `CREATE TRIGGER "TR_movement_types_guard" BEFORE UPDATE OR DELETE ON "movement_types"
       FOR EACH ROW EXECUTE FUNCTION "movement_types_guard"()`,
];

const DOWN = [
  `DROP TRIGGER "TR_movement_types_guard" ON "movement_types"`,
  `DROP FUNCTION "movement_types_guard"()`,
  `DROP TABLE "movement_types"`,
];

export class CreateMovementTypes1794800000001 implements MigrationInterface {
  name = 'CreateMovementTypes1794800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
    // Cada tipo nace 1 ms después del anterior: el orden por creación es el de la lista.
    for (const [index, [code, name, kind, system]] of MIGRATION_SEED_TYPES.entries()) {
      await queryRunner.query(
        `INSERT INTO "movement_types" ("code", "name", "kind", "system", "created_at")
         VALUES ($1, $2, $3, $4, now() + ($5 * interval '1 millisecond'))`,
        [code, name, kind, system, index]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
