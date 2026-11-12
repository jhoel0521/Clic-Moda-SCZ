import { afterFailure, DELIVERY_POLICY } from '../application/events/delivery-policy.js';
import type { EventDeliveriesPort } from '../application/events/event-deliveries.port.js';
import type { NewEvent } from './in-memory-event-deliveries.js';

export interface DeliveriesWorld {
  deliveries: EventDeliveriesPort;
  // Guarda un evento como lo hace el outbox: con una entrega por cada suscriptor ya registrado.
  publish(event: NewEvent): Promise<string>;
}
type Factory = () => Promise<DeliveriesWorld> | DeliveriesWorld;

const T0 = new Date('2026-11-12T10:00:00Z');
const at = (ms: number): Date => new Date(T0.getTime() + ms);
const event = (aggregateId = '00000000-0000-4000-8000-000000000001'): NewEvent => ({
  type: 'stock.applied',
  aggregateId,
  payload: { delta: 5 },
  occurredAt: T0,
});
const LEASE = DELIVERY_POLICY.leaseMs;

async function worldWith(make: Factory, subscribers: string[]): Promise<DeliveriesWorld> {
  const world = await make();
  await world.deliveries.registerSubscribers(subscribers, T0);
  return world;
}

function creationCases(make: Factory): void {
  it('crea una entrega por suscriptor y cada una se entrega por separado', async () => {
    const { deliveries, publish } = await worldWith(make, ['catalogo', 'estado']);
    await publish(event());

    const first = await deliveries.claimNext(T0, LEASE);
    const second = await deliveries.claimNext(T0, LEASE);

    expect([first?.subscriber, second?.subscriber].sort()).toEqual(['catalogo', 'estado']);
    expect(first?.event).toMatchObject({ type: 'stock.applied', payload: { delta: 5 } });
    expect(await deliveries.claimNext(T0, LEASE)).toBeNull();
  });

  it('sin suscriptores no hay entregas, y un suscriptor tardío no recibe el pasado', async () => {
    const { deliveries, publish } = await make();
    await publish(event());
    await deliveries.registerSubscribers(['tardio'], at(1000));
    await publish(event());

    const claimed = await deliveries.claimNext(at(2000), LEASE);

    expect(claimed?.subscriber).toBe('tardio');
    expect(await deliveries.claimNext(at(2000), LEASE)).toBeNull();
  });
}

function claimCases(make: Factory): void {
  it('reclamar suma el intento y la reserva impide que otra pasada la tome hasta que vence', async () => {
    const { deliveries, publish } = await worldWith(make, ['catalogo']);
    await publish(event());

    const first = await deliveries.claimNext(T0, LEASE);

    expect(first?.attempts).toBe(1);
    expect(await deliveries.claimNext(at(LEASE - 1), LEASE)).toBeNull();
    expect((await deliveries.claimNext(at(LEASE + 1), LEASE))?.attempts).toBe(2);
  });

  it('una entrega ejecutada no vuelve a entregarse y su repetición se reconoce como duplicada', async () => {
    const { deliveries, publish } = await worldWith(make, ['catalogo']);
    await publish(event());
    const claimed = await deliveries.claimNext(T0, LEASE);
    const id = claimed?.deliveryId as string;

    expect(await deliveries.markExecuted(id, T0)).toBe(true);
    expect(await deliveries.markExecuted(id, T0)).toBe(false);
    expect(await deliveries.claimNext(at(10 * LEASE), LEASE)).toBeNull();
  });
}

async function failUntilReview(world: DeliveriesWorld): Promise<Date> {
  let now = T0;
  for (let attempt = 1; attempt <= DELIVERY_POLICY.maxAttempts; attempt += 1) {
    const claimed = await world.deliveries.claimNext(now, LEASE);
    expect(claimed?.attempts).toBe(attempt);
    const outcome = afterFailure(attempt, now);
    await world.deliveries.markFailed(claimed?.deliveryId as string, 'falla simulada', outcome);
    now = new Date(now.getTime() + 60_000);
  }
  return now;
}

function failureCases(make: Factory): void {
  it('un fallo reprograma con espera y al llegar al máximo pasa a necesita revisión', async () => {
    const world = await worldWith(make, ['catalogo']);
    await world.publish(event());

    const now = await failUntilReview(world);

    expect(await world.deliveries.claimNext(at(10 * 3_600_000), LEASE)).toBeNull();
    expect(await world.deliveries.stats(now)).toMatchObject({ pending: 0, needsReview: 1 });
    expect((await world.deliveries.listNeedsReview(10))[0]).toMatchObject({
      lastError: 'falla simulada',
    });
  });

  it('el reintento manual devuelve la entrega a pendiente con los intentos en cero', async () => {
    const { deliveries, publish } = await worldWith(make, ['catalogo']);
    await publish(event());
    const claimed = await deliveries.claimNext(T0, LEASE);
    const id = claimed?.deliveryId as string;
    await deliveries.markFailed(id, 'x', { status: 'needs_review', retryAt: null });

    expect(await deliveries.retry(id, at(1000))).toBe(true);
    expect(await deliveries.retry(id, at(1000))).toBe(false);
    expect((await deliveries.claimNext(at(1000), LEASE))?.attempts).toBe(1);
  });
}

function statsCases(make: Factory): void {
  it('informa pendientes, en revisión y la antigüedad de la pendiente más antigua', async () => {
    const { deliveries, publish } = await worldWith(make, ['catalogo']);
    expect(await deliveries.stats(T0)).toEqual({
      pending: 0,
      needsReview: 0,
      oldestPendingAgeMs: null,
    });
    await publish(event());
    await publish(event());

    const stats = await deliveries.stats(at(5000));

    expect(stats).toEqual({ pending: 2, needsReview: 0, oldestPendingAgeMs: 5000 });
  });
}

// Suite de contrato: toda implementación del puerto (fake en memoria y Postgres) debe pasarla.
export function eventDeliveriesContract(label: string, make: Factory): void {
  describe(`EventDeliveriesPort: ${label}`, () => {
    creationCases(make);
    claimCases(make);
    failureCases(make);
    statsCases(make);
  });
}
