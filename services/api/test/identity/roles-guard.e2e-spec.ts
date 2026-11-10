import { JwtSigner } from '@nestjs/authentication';
import { Controller, Get, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../../src/app.module.js';
import { Roles } from '../../src/identity/infrastructure/http/roles.decorator.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import {
  USERS_REPOSITORY,
  type UsersRepository,
} from '../../src/identity/domain/users.repository.port.js';
import { resetDatabase, seedStaff, STAFF_PASSWORD } from '../support/identity.js';

// Rutas de prueba (no existen en la API real): una por combinación de roles.
@Controller('probe')
class ProbeController {
  @Roles('GERENTE')
  @Get('gerente')
  gerente() {
    return { ok: true };
  }

  @Roles('DESPACHO', 'ATENCION')
  @Get('operacion')
  operacion() {
    return { ok: true };
  }
}

let app: INestApplication<App>;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: [ProbeController],
  }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
  await resetDatabase(app);
});

afterAll(async () => {
  await app.close();
});

async function tokenFor(email: string): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password: STAFF_PASSWORD })
    .expect(200);
  return res.body.accessToken;
}

const get = (path: string, token?: string) => {
  const call = request(app.getHttpServer()).get(path);
  return token ? call.set('Authorization', `Bearer ${token}`) : call;
};

describe('Autenticación de las rutas', () => {
  it('sin credenciales responde 401', async () => {
    await get('/probe/gerente').expect(401);
  });

  it('con credenciales vencidas responde 401', async () => {
    const staff = await seedStaff(app, 'vencido@tienda.com', [Role.GERENTE]);
    const signer = new JwtSigner({
      key: process.env.AUTH_JWT_KEY as string,
      issuer: 'clic-moda-api',
      audience: 'clic-moda',
      ttl: '15m',
      now: () => Date.now() - 2 * 60 * 60 * 1000,
    });

    await get('/probe/gerente', signer.sign({ sub: staff.id.value })).expect(401);
  });

  it('un token válido de un usuario sin roles responde 401', async () => {
    const staff = await seedStaff(app, 'sinroles@tienda.com', [Role.GERENTE]);
    const token = await tokenFor('sinroles@tienda.com');
    staff.assignRoles([]);
    await app.get<UsersRepository>(USERS_REPOSITORY).save(staff);

    await get('/probe/gerente', token).expect(401);
  });
});

describe('Autorización por rol', () => {
  it('ningún rol permitido: 403', async () => {
    await seedStaff(app, 'despacho@tienda.com', [Role.DESPACHO]);

    await get('/probe/gerente', await tokenFor('despacho@tienda.com')).expect(403);
  });

  it('un rol permitido: 200', async () => {
    await seedStaff(app, 'jefe@tienda.com', [Role.GERENTE]);

    await get('/probe/gerente', await tokenFor('jefe@tienda.com')).expect(200);
  });

  it('con varios roles basta uno de los permitidos', async () => {
    await seedStaff(app, 'multi@tienda.com', [Role.ATENCION, Role.DESPACHO]);
    const token = await tokenFor('multi@tienda.com');

    await get('/probe/operacion', token).expect(200);
    await get('/probe/gerente', token).expect(403);
  });
});

describe('Cambios de roles y perfil', () => {
  it('un cambio de roles surte efecto de inmediato con el MISMO token', async () => {
    const staff = await seedStaff(app, 'cambia@tienda.com', [Role.GERENTE, Role.DESPACHO]);
    const token = await tokenFor('cambia@tienda.com');
    await get('/probe/gerente', token).expect(200);

    staff.assignRoles([Role.DESPACHO]);
    await app.get<UsersRepository>(USERS_REPOSITORY).save(staff);

    await get('/probe/gerente', token).expect(403);
  });

  it('GET /auth/me devuelve el perfil con sus roles y exige sesión', async () => {
    await seedStaff(app, 'yo@tienda.com', [Role.ATENCION]);
    const res = await get('/auth/me', await tokenFor('yo@tienda.com')).expect(200);

    expect(res.body).toMatchObject({ email: 'yo@tienda.com', roles: ['ATENCION'] });
    await get('/auth/me').expect(401);
  });
});
