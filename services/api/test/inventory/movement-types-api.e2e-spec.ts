import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import { call, resetCatalog, seedTokens, startApp, type StaffTokens } from '../support/http.js';

let app: INestApplication<App>;
let tokens: StaffTokens;

beforeAll(async () => {
  app = await startApp();
  tokens = await seedTokens(app);
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await resetCatalog(app);
});

const TYPES = '/inventory/movement-types';
const create = (token: string, name: string, kind = 'RECEIVE') =>
  call(app, 'post', TYPES, token, { name, kind });

describe('Tipos de movimiento: lectura', () => {
  it('todo el personal lee los tipos activos, los de sistema primero', async () => {
    const response = await call(app, 'get', TYPES, tokens.despacho).expect(200);

    const codes = response.body.map((type: { code: string }) => type.code);
    expect(codes.slice(0, 3)).toEqual(['RECEIVE', 'WITHDRAW', 'ADJUST']);
    expect(codes).toContain('SALE');
  });

  it('sin sesión responde 401', async () => {
    await call(app, 'get', TYPES, undefined).expect(401);
  });

  it('solo el Gerente ve los desactivados', async () => {
    await call(app, 'patch', `${TYPES}/GIFT`, tokens.gerente, { active: false }).expect(200);

    await call(app, 'get', `${TYPES}?includeInactive=true`, tokens.despacho).expect(403);
    const all = await call(app, 'get', `${TYPES}?includeInactive=true`, tokens.gerente).expect(200);
    const active = await call(app, 'get', TYPES, tokens.atencion).expect(200);

    expect(all.body.map((type: { code: string }) => type.code)).toContain('GIFT');
    expect(active.body.map((type: { code: string }) => type.code)).not.toContain('GIFT');
  });
});

describe('Tipos de movimiento: escritura solo del Gerente', () => {
  it('Despacho y Atención no pueden crear ni cambiar', async () => {
    await create(tokens.despacho, 'Cambio por talla').expect(403);
    await create(tokens.atencion, 'Cambio por talla').expect(403);
    await call(app, 'patch', `${TYPES}/SALE`, tokens.despacho, { name: 'Otra' }).expect(403);
  });

  it('el Gerente crea un tipo y el código sale del nombre, con sufijo si se repite', async () => {
    const first = await create(tokens.gerente, 'Cambio por talla').expect(201);
    const second = await create(tokens.gerente, 'Cambio por talla').expect(201);

    expect([first.body.code, second.body.code]).toEqual(['CAMBIO_POR_TALLA', 'CAMBIO_POR_TALLA_2']);
    expect(first.body).toMatchObject({ kind: 'RECEIVE', active: true, system: false });
  });

  it('un nombre inválido o una clase desconocida responden 422 con el campo', async () => {
    const badName = await create(tokens.gerente, 'ab').expect(422);
    const badKind = await create(tokens.gerente, 'Cambio por talla', 'X').expect(422);

    expect(badName.body.issues).toEqual([expect.objectContaining({ field: 'name' })]);
    expect(badKind.body.issues).toEqual([expect.objectContaining({ field: 'kind' })]);
  });
});

describe('Tipos de movimiento: cambios', () => {
  it('renombrar conserva el código y desactivar un tipo de sistema responde 409', async () => {
    const renamed = await call(app, 'patch', `${TYPES}/SALE`, tokens.gerente, {
      name: 'Venta al cliente',
    }).expect(200);

    expect([renamed.body.code, renamed.body.name]).toEqual(['SALE', 'Venta al cliente']);
    await call(app, 'patch', `${TYPES}/RECEIVE`, tokens.gerente, { active: false }).expect(409);
  });

  it('un código desconocido responde 404 y borrar no existe', async () => {
    await call(app, 'patch', `${TYPES}/NO_EXISTE`, tokens.gerente, { active: false }).expect(404);
    await call(app, 'delete', `${TYPES}/SALE`, tokens.gerente).expect(404);
  });

  it('un cuerpo vacío se rechaza', async () => {
    await call(app, 'patch', `${TYPES}/SALE`, tokens.gerente, {}).expect(400);
  });
});
