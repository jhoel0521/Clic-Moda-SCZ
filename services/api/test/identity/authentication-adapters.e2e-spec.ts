import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { AuthenticateStaffCommand } from '../../src/identity/application/dtos/authenticate-staff.command.js';
import {
  PASSWORD_HASHER,
  type PasswordHasherPort,
} from '../../src/identity/application/ports/password-hasher.port.js';
import {
  AuthenticateStaffUseCase,
  STAFF_SESSION_MAX_SECONDS,
} from '../../src/identity/application/use-cases/authenticate-staff.use-case.js';
import { User } from '../../src/identity/domain/entities/user.entity.js';
import { InvalidCredentialsError } from '../../src/identity/domain/errors/invalid-credentials.error.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../../src/identity/domain/users.repository.port.js';
import { Email } from '../../src/identity/domain/value-objects/email.vo.js';
import { PersonName } from '../../src/identity/domain/value-objects/person-name.vo.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { truncateAll } from '../support/db.js';

const PASSWORD = 'clave-segura-123';
let app: INestApplication<App>;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
});

afterAll(async () => {
  await app.close();
});

const decodePayload = (jwt: string): Record<string, unknown> =>
  JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'));

async function seedStaff(): Promise<User> {
  await truncateAll(app.get(DataSource));
  const hasher = app.get<PasswordHasherPort>(PASSWORD_HASHER);
  const staff = User.create({
    email: Email.of('ana@correo.com'),
    name: PersonName.of('Ana Pérez'),
    passwordHash: await hasher.hash(PASSWORD),
  });
  staff.assignRoles([Role.GERENTE, Role.DESPACHO]);
  await app.get<UsersRepository>(USERS_REPOSITORY).save(staff);
  return staff;
}

describe('Adaptador del hasher (scrypt del paquete)', () => {
  it('hashea con scrypt, sin contener la contraseña, y verifica solo la correcta', async () => {
    const hasher = app.get<PasswordHasherPort>(PASSWORD_HASHER);
    const hash = await hasher.hash(PASSWORD);

    expect(hash.value).toMatch(/^\$scrypt\$/);
    expect(hash.value).not.toContain(PASSWORD);
    expect([await hasher.verify(PASSWORD, hash), await hasher.verify('otra', hash)]).toEqual([
      true,
      false,
    ]);
  });
});

describe('Adaptador del emisor de tokens (TokenService del paquete)', () => {
  it('emite un JWT de 15 minutos que identifica al usuario y NO lleva sus roles', async () => {
    const staff = await seedStaff();
    const result = await app
      .get(AuthenticateStaffUseCase)
      .execute(new AuthenticateStaffCommand('ana@correo.com', PASSWORD));
    const claims = decodePayload(result.accessToken);

    expect(claims.sub).toBe(staff.id.value);
    expect(Number(claims.exp) - Number(claims.iat)).toBe(15 * 60);
    expect(JSON.stringify(claims)).not.toMatch(/GERENTE|DESPACHO|roles/);
  });

  it('la vigencia que devuelve no supera el techo de 8 horas', async () => {
    await seedStaff();
    const result = await app
      .get(AuthenticateStaffUseCase)
      .execute(new AuthenticateStaffCommand('ana@correo.com', PASSWORD));

    expect(result.expiresInSeconds).toBeLessThanOrEqual(STAFF_SESSION_MAX_SECONDS);
    expect(result.user.roles).toEqual(['GERENTE', 'DESPACHO']);
  });
});

describe('Refresh token y credenciales', () => {
  it('se guarda solo su hash y la familia no supera las 8 horas', async () => {
    await seedStaff();
    const result = await app
      .get(AuthenticateStaffUseCase)
      .execute(new AuthenticateStaffCommand('ana@correo.com', PASSWORD));
    const [row] = await app.get(DataSource).query(
      `SELECT id, extract(epoch from (family_expires_at - created_at))::int AS family_seconds
         FROM refresh_tokens`
    );

    expect(row.id).not.toBe(result.refreshToken);
    expect(row.family_seconds).toBeLessThanOrEqual(STAFF_SESSION_MAX_SECONDS);
  });

  it('con la contraseña errónea falla con el error de credenciales y no guarda nada', async () => {
    await seedStaff();

    await expect(
      app
        .get(AuthenticateStaffUseCase)
        .execute(new AuthenticateStaffCommand('ana@correo.com', 'mala'))
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
    expect(await app.get(DataSource).query('SELECT 1 FROM refresh_tokens')).toHaveLength(0);
  });
});

describe('Guard global de autenticación', () => {
  it('/health sigue siendo público (marcado con @Public)', async () => {
    await request(app.getHttpServer()).get('/health').expect(200);
  });
});
