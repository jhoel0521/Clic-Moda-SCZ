import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRefreshTokens1794324050035 implements MigrationInterface {
  name = 'CreateRefreshTokens1794324050035';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "revoked_refresh_families" ("family_id" text NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "expires_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_426b14c3134b270c01c8eeb96b8" PRIMARY KEY ("family_id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" ("id" text NOT NULL, "family_id" text NOT NULL, "user_id" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "family_expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "used_at" TIMESTAMP WITH TIME ZONE, "claims" jsonb, CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d5e27da0cd39bc3bb2811fc8ba" ON "refresh_tokens"  ("family_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3ddc983c5f7bcf132fd8732c3f" ON "refresh_tokens"  ("user_id") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_3ddc983c5f7bcf132fd8732c3f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d5e27da0cd39bc3bb2811fc8ba"`);
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "revoked_refresh_families"`);
  }
}
