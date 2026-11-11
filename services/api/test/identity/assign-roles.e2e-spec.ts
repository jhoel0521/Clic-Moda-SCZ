import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import {
  AssignRolesCommand,
  SearchUsersQuery,
} from '../../src/identity/application/dtos/assign-roles.dto.js';
import { AssignRolesUseCase } from '../../src/identity/application/use-cases/assign-roles.use-case.js';
import { SearchUsersUseCase } from '../../src/identity/application/use-cases/search-users.use-case.js';
import { LastManagerError } from '../../src/identity/domain/errors/last-manager.error.js';
import { Role } from '../../src/identity/domain/value-objects/role.vo.js';
import { resetDatabase, seedStaff } from '../support/identity.js';

let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
});

beforeEach(async () => {
  await resetDatabase(app);
});

afterAll(async () => {
  await app.close();
});

const eventRows = (): Promise<{ operator: string; new_roles: string[] }[]> =>
  app.get(DataSource).query('SELECT operator, new_roles FROM user_role_events');

describe('Asignar roles (e2e, base real)', () => {
  it('asigna varios roles y registra el cambio con el operador', async () => {
    await seedStaff(app, 'jefe@tienda.com', [Role.GERENTE]);
    const ana = await seedStaff(app, 'ana@tienda.com', [Role.ATENCION]);
    await app
      .get(AssignRolesUseCase)
      .execute(new AssignRolesCommand(ana.id.value, ['DESPACHO', 'ATENCION'], 'jhoel'));

    expect(await eventRows()).toEqual([{ operator: 'jhoel', new_roles: ['DESPACHO', 'ATENCION'] }]);
  });

  it('rechaza quitar el rol al único Gerente: nada cambia y no se registra', async () => {
    const jefe = await seedStaff(app, 'jefe@tienda.com', [Role.GERENTE]);

    await expect(
      app.get(AssignRolesUseCase).execute(new AssignRolesCommand(jefe.id.value, [], 'jhoel'))
    ).rejects.toBeInstanceOf(LastManagerError);
    expect(await eventRows()).toHaveLength(0);
    const [{ n }] = await app
      .get(DataSource)
      .query("SELECT count(*)::int AS n FROM user_roles WHERE role = 'GERENTE'");
    expect(n).toBe(1);
  });
});

describe('Buscar usuarios (e2e, base real)', () => {
  it('encuentra por parte del correo con sus roles', async () => {
    await seedStaff(app, 'beto.rojas@tienda.com', [Role.DESPACHO, Role.ATENCION]);
    const [found] = await app.get(SearchUsersUseCase).execute(new SearchUsersQuery('ROJAS', 5));

    expect(found).toMatchObject({
      email: 'beto.rojas@tienda.com',
      roles: ['DESPACHO', 'ATENCION'],
    });
  });
});
