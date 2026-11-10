import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import { ProcessNextStockCommandUseCase } from '../../src/inventory/application/use-cases/process-next-stock-command.use-case.js';
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

// Procesa la cola hasta vaciarla (el procesador automático está apagado en las pruebas).
async function drain(): Promise<void> {
  const useCase = app.get(ProcessNextStockCommandUseCase);
  while (await useCase.execute()) continue;
}

async function newVariant(): Promise<string> {
  const category = await call(app, 'post', '/catalog/categories', tokens.gerente, {
    name: 'Botas',
  });
  const variants = [{ size: '38', price: '100' }];
  const body = { categoryId: category.body.id, name: 'Bota', variants };
  const product = await call(app, 'post', '/catalog/products', tokens.gerente, body).expect(201);
  return product.body.variants[0].id;
}

// Encola un comando de stock con el token dado.
const send = (token: string, variantId: string, type: string, units: number) =>
  call(app, 'post', '/inventory/commands', token, { variantId, type, units, reason: 'Prueba e2e' });

const firstStock = async () =>
  (await call(app, 'get', '/inventory/stock', tokens.atencion)).body.items[0];

describe('Inventario: cola de comandos', () => {
  it('responde 202 con el id y Location, y el stock cambia solo al procesar', async () => {
    const variantId = await newVariant();
    const accepted = await send(tokens.despacho, variantId, 'RECEIVE', 12).expect(202);
    const location = `/inventory/commands/${accepted.body.id}`;

    expect([accepted.body.status, accepted.headers.location]).toEqual(['PENDING', location]);
    expect((await firstStock()).onHand).toBe(0);
    await drain();
    expect((await call(app, 'get', location, tokens.atencion)).body.status).toBe('APPLIED');
    expect(await firstStock()).toMatchObject({ onHand: 12, available: 12 });
  });

  it('una salida mayor al stock queda REJECTED y la misma clave devuelve el mismo comando', async () => {
    const variantId = await newVariant();
    const withdraw = () =>
      send(tokens.gerente, variantId, 'WITHDRAW', 5).set('Idempotency-Key', 'clave-prueba-1');
    const first = await withdraw().expect(202);
    const again = await withdraw().expect(202);
    await drain();

    expect(again.body.id).toBe(first.body.id);
    const done = await call(app, 'get', `/inventory/commands/${first.body.id}`, tokens.gerente);
    expect([done.body.status, done.body.rejectReason]).toEqual(['REJECTED', 'INSUFFICIENT_STOCK']);
  });
});

describe('Inventario: roles (cierra la tarea 9.2 de la fundación)', () => {
  it('Gerente y Despacho escriben (202); Atención recibe 403 y no se encola nada', async () => {
    const variantId = await newVariant();
    await send(tokens.gerente, variantId, 'RECEIVE', 1).expect(202);
    await send(tokens.despacho, variantId, 'RECEIVE', 1).expect(202);
    await send(tokens.atencion, variantId, 'RECEIVE', 1).expect(403);

    expect((await call(app, 'get', '/inventory/queue', tokens.atencion)).body.pending).toBe(2);
  });

  it('sin sesión 401; todo el personal consulta; Atención no cambia ubicación ni umbral', async () => {
    const variantId = await newVariant();
    const settings = { location: 'Estante A-2', reorderLevel: 3 };
    const patch = (token: string) =>
      call(app, 'patch', `/inventory/stock/${variantId}/settings`, token, settings);
    await call(app, 'get', '/inventory/stock').expect(401);
    for (const token of Object.values(tokens)) {
      await call(app, 'get', '/inventory/stock/low', token).expect(200);
    }

    await patch(tokens.despacho).expect(200);
    await patch(tokens.atencion).expect(403);
  });
});

describe('Inventario: validaciones', () => {
  it('rechaza lo inválido sin encolar: cantidad 0, motivo corto, tipo desconocido, variante inexistente', async () => {
    const variantId = await newVariant();
    const raw = (body: object) => call(app, 'post', '/inventory/commands', tokens.gerente, body);
    const base = { variantId, type: 'RECEIVE', units: 1, reason: 'Prueba e2e' };

    await send(tokens.gerente, variantId, 'RECEIVE', 0).expect(400);
    await raw({ ...base, reason: 'ab' }).expect(400);
    await raw({ ...base, type: 'BORRAR' }).expect(400);
    await raw({ ...base, variantId: '00000000-0000-4000-8000-000000000000' }).expect(404);
    expect((await call(app, 'get', '/inventory/queue', tokens.gerente)).body.pending).toBe(0);
  });
});

describe('Inventario: lecturas', () => {
  it('lista stock bajo y el historial de movimientos, del más reciente al más antiguo', async () => {
    const variantId = await newVariant();
    await send(tokens.gerente, variantId, 'RECEIVE', 10).expect(202);
    await send(tokens.gerente, variantId, 'WITHDRAW', 4).expect(202);
    await drain();
    const low = await call(app, 'get', '/inventory/stock/low', tokens.atencion).expect(200);
    const path = `/inventory/variants/${variantId}/movements`;
    const moves = await call(app, 'get', path, tokens.atencion).expect(200);

    expect(low.body.total).toBe(0);
    expect(moves.body.items.map((m: { delta: number }) => m.delta)).toEqual([-4, 10]);
  });
});
