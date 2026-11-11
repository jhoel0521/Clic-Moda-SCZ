import type { MigrationInterface, QueryRunner } from 'typeorm';

// citext: texto sin distinguir mayúsculas; lo usará el correo de los usuarios.
export class EnableCitext1794322288689 implements MigrationInterface {
  name = 'EnableCitext1794322288689';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS citext');
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP EXTENSION IF EXISTS citext');
  }
}
