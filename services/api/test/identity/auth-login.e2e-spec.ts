import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { resetDatabase, seedStaff, STAFF_PASSWORD } from '../support/identity.js';

let app: INestApplication<App>;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
  await resetDatabase(app);
});

afterAll(async () => {
  await app.close();
});

const login = (email: string, password: string) =>
  request(app.getHttpServer()).post('/auth/login').send({ email, password });

describe('POST /auth/login: inicio de sesión', () => {
  it('con credenciales válidas devuelve 200, credenciales y los roles, sin contraseña ni hash', async () => {
    await seedStaff(app, 'valido@tienda.com', [Role.DESPACHO, Role.ATENCION]);
    const res = await login('valido@tienda.com', STAFF_PASSWORD).expect(200);

    expect(res.body.user.roles).toEqual(['DESPACHO', 'ATENCION']);
    expect(res.body.expiresInSeconds).toBeLessThanOrEqual(8 * 60 * 60);
    expect(JSON.stringify(res.body)).not.toMatch(/scrypt|clave-segura/);
  });

  it('no necesita credenciales previas: la ruta es pública', async () => {
    await seedStaff(app, 'publico@tienda.com', [Role.GERENTE]);

    await login('publico@tienda.com', STAFF_PASSWORD).expect(200);
  });
});

describe('POST /auth/login: fallos', () => {
  it('contraseña errónea y correo desconocido dan 401 con la MISMA respuesta', async () => {
    await seedStaff(app, 'existe@tienda.com', [Role.GERENTE]);
    const wrong = await login('existe@tienda.com', 'incorrecta').expect(401);
    const unknown = await login('noexiste@tienda.com', 'incorrecta').expect(401);

    expect(wrong.body).toEqual(unknown.body);
    expect(wrong.body).toMatchObject({
      error: 'UNAUTHENTICATED',
      message: 'Credenciales inválidas',
    });
  });

  it('un cuerpo sin contraseña es un error de validación 400', async () => {
    await request(app.getHttpServer()).post('/auth/login').send({ email: 'a@b.com' }).expect(400);
  });
});

describe('POST /auth/login: límite de intentos por correo', () => {
  it('el sexto intento recibe 429 incluso con la contraseña correcta', async () => {
    await seedStaff(app, 'limitado@tienda.com', [Role.GERENTE]);
    for (let attempt = 0; attempt < 5; attempt++)
      await login('limitado@tienda.com', 'mala').expect(401);

    await login('limitado@tienda.com', STAFF_PASSWORD).expect(429);
  });

  it('otro correo no se ve afectado por el bloqueo', async () => {
    await seedStaff(app, 'bloqueado@tienda.com', [Role.GERENTE]);
    await seedStaff(app, 'libre@tienda.com', [Role.GERENTE]);
    for (let attempt = 0; attempt < 5; attempt++) await login('bloqueado@tienda.com', 'mala');

    await login('libre@tienda.com', STAFF_PASSWORD).expect(200);
  });

  it('el límite no distingue mayúsculas en el correo', async () => {
    await seedStaff(app, 'mayus@tienda.com', [Role.GERENTE]);
    for (let attempt = 0; attempt < 5; attempt++) await login('MAYUS@tienda.com', 'mala');

    await login('mayus@tienda.com', STAFF_PASSWORD).expect(429);
  });
});
