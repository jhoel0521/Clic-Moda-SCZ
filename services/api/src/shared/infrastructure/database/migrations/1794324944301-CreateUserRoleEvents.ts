import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRoleEvents1794324944301 implements MigrationInterface {
  name = 'CreateUserRoleEvents1794324944301';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_role_events" ("id" uuid NOT NULL, "user_id" uuid NOT NULL, "previous_roles" text array NOT NULL, "new_roles" text array NOT NULL, "operator" text NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_314201781629856a903fdd5125f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3360e7618a4de34e96c204f390" ON "user_role_events"  ("user_id") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_role_events" ADD CONSTRAINT "FK_3360e7618a4de34e96c204f390f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_role_events" DROP CONSTRAINT "FK_3360e7618a4de34e96c204f390f"`
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_3360e7618a4de34e96c204f390"`);
    await queryRunner.query(`DROP TABLE "user_role_events"`);
  }
}
