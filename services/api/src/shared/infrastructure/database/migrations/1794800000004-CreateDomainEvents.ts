import type { MigrationInterface, QueryRunner } from 'typeorm';

// Eventos de dominio guardados con el cambio que los origina (outbox) y sus entregas por suscriptor.
// `seq` se asigna al insertar y solo ordena dentro de una variante (el candado de la variante serializa).
// Las entregas se crean con el evento, una por suscriptor registrado en ese momento: un suscriptor nuevo
// no recibe el pasado. Un evento no se modifica (trigger); sí puede purgarse con sus entregas (CASCADE).
const UP = [
  `CREATE TABLE "domain_events" (
        "id" uuid NOT NULL,
        "seq" bigint GENERATED ALWAYS AS IDENTITY,
        "type" character varying(60) NOT NULL,
        "aggregate_id" uuid NOT NULL,
        "payload" jsonb NOT NULL,
        "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_domain_events" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_domain_events_seq" UNIQUE ("seq")
      )`,
  `CREATE INDEX "IDX_domain_events_aggregate" ON "domain_events" ("aggregate_id", "seq")`,
  `CREATE FUNCTION "domain_events_immutable"() RETURNS trigger AS $$
       BEGIN RAISE EXCEPTION 'domain_events es inmutable'; END; $$ LANGUAGE plpgsql`,
  `CREATE TRIGGER "TR_domain_events_immutable" BEFORE UPDATE ON "domain_events"
       FOR EACH ROW EXECUTE FUNCTION "domain_events_immutable"()`,
  `CREATE TABLE "event_subscribers" (
        "name" character varying(60) NOT NULL,
        "registered_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_event_subscribers" PRIMARY KEY ("name")
      )`,
  `CREATE TABLE "event_deliveries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "event_id" uuid NOT NULL,
        "subscriber" character varying(60) NOT NULL,
        "status" character varying(14) NOT NULL DEFAULT 'pending',
        "attempts" smallint NOT NULL DEFAULT 0,
        "last_error" text,
        "available_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "executed_at" TIMESTAMP WITH TIME ZONE,
        "deduplicated" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_event_deliveries" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_event_deliveries_event_subscriber" UNIQUE ("event_id", "subscriber"),
        CONSTRAINT "FK_event_deliveries_event" FOREIGN KEY ("event_id")
          REFERENCES "domain_events" ("id") ON DELETE CASCADE,
        CONSTRAINT "CK_event_deliveries_status"
          CHECK ("status" IN ('pending', 'executed', 'needs_review')),
        CONSTRAINT "CK_event_deliveries_executed" CHECK (("status" = 'executed') = ("executed_at" IS NOT NULL))
      )`,
  `CREATE INDEX "IDX_event_deliveries_pending" ON "event_deliveries" ("available_at") WHERE "status" = 'pending'`,
  `CREATE INDEX "IDX_event_deliveries_review" ON "event_deliveries" ("status") WHERE "status" = 'needs_review'`,
];

const DOWN = [
  `DROP TABLE "event_deliveries"`,
  `DROP TABLE "event_subscribers"`,
  `DROP TRIGGER "TR_domain_events_immutable" ON "domain_events"`,
  `DROP FUNCTION "domain_events_immutable"()`,
  `DROP TABLE "domain_events"`,
];

export class CreateDomainEvents1794800000004 implements MigrationInterface {
  name = 'CreateDomainEvents1794800000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const sql of UP) await queryRunner.query(sql);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const sql of DOWN) await queryRunner.query(sql);
  }
}
