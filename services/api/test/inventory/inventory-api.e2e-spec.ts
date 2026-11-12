import type { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { App } from 'supertest/types.js';
import { EVENT_DELIVERIES } from '../../src/shared/application/events/event-deliveries.port.js';
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
    expect(moves.body.items.map((m: { balanceAfter: number }) => m.balanceAfter)).toEqual([6, 10]);
  });
});

const sendTyped = (variantId: string, type: string, units: number, typeCode: string) =>
  call(app, 'post', '/inventory/commands', tokens.gerente, {
    variantId,
    type,
    units,
    typeCode,
    reason: 'Prueba de tipo',
  });

describe('Inventario: tipos de movimiento (historial y filtro)', () => {
  it('una salida con el tipo "Merma o daño" queda en el historial y se filtra por su código', async () => {
    const variantId = await newVariant();
    await sendTyped(variantId, 'RECEIVE', 10, 'PURCHASE').expect(202);
    await sendTyped(variantId, 'WITHDRAW', 2, 'SHRINKAGE').expect(202);
    await drain();
    const path = `/inventory/variants/${variantId}/movements`;

    const shrinkage = await call(app, 'get', `${path}?typeCode=SHRINKAGE`, tokens.atencion);
    const all = await call(app, 'get', path, tokens.atencion);

    expect(shrinkage.body.items).toEqual([
      expect.objectContaining({ typeCode: 'SHRINKAGE', typeName: 'Merma o daño', delta: -2 }),
    ]);
    expect(all.body.items.map((m: { typeCode: string }) => m.typeCode)).toEqual([
      'SHRINKAGE',
      'PURCHASE',
    ]);
  });
});

describe('Inventario: tipos de movimiento (renombrar)', () => {
  it('renombrar el tipo cambia el nombre que muestra el historial, no su código', async () => {
    const variantId = await newVariant();
    await sendTyped(variantId, 'RECEIVE', 5, 'PURCHASE').expect(202);
    await drain();
    await call(app, 'patch', '/inventory/movement-types/PURCHASE', tokens.gerente, {
      name: 'Compra al proveedor',
    }).expect(200);

    const moves = await call(
      app,
      'get',
      `/inventory/variants/${variantId}/movements`,
      tokens.atencion
    );

    expect(moves.body.items[0]).toMatchObject({
      typeCode: 'PURCHASE',
      typeName: 'Compra al proveedor',
    });
  });
});

describe('Inventario: tipos de movimiento (rechazos)', () => {
  it('un tipo de otra clase o desactivado se rechaza con 422 sin encolar', async () => {
    const variantId = await newVariant();
    await call(app, 'patch', '/inventory/movement-types/GIFT', tokens.gerente, { active: false });

    const wrongKind = await sendTyped(variantId, 'RECEIVE', 1, 'SHRINKAGE').expect(422);
    const inactive = await sendTyped(variantId, 'WITHDRAW', 1, 'GIFT').expect(422);

    expect(wrongKind.body.issues[0]).toMatchObject({ field: 'typeCode' });
    expect(inactive.body.issues[0]).toMatchObject({ field: 'typeCode' });
    expect((await call(app, 'get', '/inventory/queue', tokens.gerente)).body.pending).toBe(0);
  });
});

describe('Inventario: tipos de movimiento (pendientes)', () => {
  it('un comando pendiente se procesa aunque su tipo se desactive después', async () => {
    const variantId = await newVariant();
    await sendTyped(variantId, 'RECEIVE', 5, 'PURCHASE').expect(202);
    await call(app, 'patch', '/inventory/movement-types/PURCHASE', tokens.gerente, {
      active: false,
    }).expect(200);

    await drain();

    const moves = await call(
      app,
      'get',
      `/inventory/variants/${variantId}/movements`,
      tokens.atencion
    );
    expect(moves.body.items[0]).toMatchObject({ typeCode: 'PURCHASE', delta: 5 });
  });
});

const count = async (table: string): Promise<number> =>
  (await app.get(DataSource).query(`SELECT count(*)::int AS total FROM ${table}`))[0].total;

describe('Inventario: eventos al aplicar', () => {
  it('aplicar guarda un evento y una entrega por suscriptor; rechazar no guarda ninguno', async () => {
    await app.get(EVENT_DELIVERIES).registerSubscribers(['catalogo', 'estado'], new Date());
    const variantId = await newVariant();
    await sendTyped(variantId, 'RECEIVE', 5, 'PURCHASE').expect(202);
    await send(tokens.gerente, variantId, 'WITHDRAW', 99).expect(202);

    await drain();

    const [event] = await app.get(DataSource).query('SELECT type, payload FROM domain_events');
    expect([await count('domain_events'), await count('event_deliveries')]).toEqual([1, 2]);
    expect(event).toMatchObject({
      type: 'stock.applied',
      payload: { typeCode: 'PURCHASE', delta: 5, onHandAfter: 5, availableAfter: 5 },
    });
  });
});

describe('Inventario: eventos y transacción', () => {
  it('si guardar el evento falla, no queda movimiento, evento ni cambio de stock', async () => {
    const db = app.get(DataSource);
    await db.query(`CREATE FUNCTION fail_event() RETURNS trigger AS $$
      BEGIN RAISE EXCEPTION 'evento rechazado a propósito'; END; $$ LANGUAGE plpgsql`);
    await db.query(`CREATE TRIGGER tr_fail_event BEFORE INSERT ON domain_events
      FOR EACH ROW EXECUTE FUNCTION fail_event()`);
    try {
      const variantId = await newVariant();
      await send(tokens.gerente, variantId, 'RECEIVE', 5).expect(202);

      await drain();

      const level = await db.query('SELECT on_hand FROM stock_levels WHERE variant_id = $1', [
        variantId,
      ]);
      expect([await count('stock_movements'), await count('domain_events')]).toEqual([0, 0]);
      expect(level[0]?.on_hand ?? 0).toBe(0);
      expect((await call(app, 'get', '/inventory/queue', tokens.gerente)).body.pending).toBe(1);
    } finally {
      await db.query('DROP TRIGGER tr_fail_event ON domain_events');
      await db.query('DROP FUNCTION fail_event()');
    }
  });
});

// Reclama una entrega ya creada y la deja agotada, esperando revisión (se prepara con el puerto).
async function sendOneToReview(): Promise<string> {
  const deliveries = app.get(EVENT_DELIVERIES);
  const claimed = await deliveries.claimNext(new Date(Date.now() + 60_000), 1000);
  const id = claimed?.deliveryId as string;
  await deliveries.markFailed(id, 'falla de prueba', { status: 'needs_review', retryAt: null });
  return id;
}

// Aplica un ingreso con un suscriptor registrado: queda una entrega pendiente.
async function applyWithSubscribers(names: string[]): Promise<void> {
  await app.get(EVENT_DELIVERIES).registerSubscribers(names, new Date());
  const variantId = await newVariant();
  await send(tokens.gerente, variantId, 'RECEIVE', 5).expect(202);
  await drain();
}

describe('Inventario: estado de las entregas de eventos', () => {
  it('el estado de la cola cuenta las entregas pendientes y las que necesitan revisión', async () => {
    await applyWithSubscribers(['catalogo', 'estado']);

    const before = await call(app, 'get', '/inventory/queue', tokens.atencion).expect(200);
    await sendOneToReview();
    const after = await call(app, 'get', '/inventory/queue', tokens.atencion).expect(200);

    expect(before.body.events).toMatchObject({ pending: 2, needsReview: 0 });
    expect(after.body.events).toMatchObject({ pending: 1, needsReview: 1 });
  });
});

describe('Inventario: revisión de entregas (solo el Gerente)', () => {
  it('el Gerente ve el último error y reintenta; los demás reciben 403', async () => {
    await applyWithSubscribers(['catalogo']);
    const id = await sendOneToReview();
    const list = await call(app, 'get', '/inventory/event-deliveries', tokens.gerente).expect(200);

    await call(app, 'get', '/inventory/event-deliveries', tokens.despacho).expect(403);
    await call(app, 'post', `/inventory/event-deliveries/${id}/retry`, tokens.despacho).expect(403);
    await call(app, 'post', `/inventory/event-deliveries/${id}/retry`, tokens.gerente).expect(204);
    await call(app, 'post', `/inventory/event-deliveries/${id}/retry`, tokens.gerente).expect(404);

    expect(list.body[0]).toMatchObject({
      id,
      lastError: 'falla de prueba',
      eventType: 'stock.applied',
    });
  });
});
