import type { ConfigService } from '@nestjs/config';
import { DELIVERY_POLICY } from '../../application/events/delivery-policy.js';
import { EventSubscriberRegistry } from '../../application/events/event-subscriber.registry.js';
import type { DomainEventRecord, EventSubscriber } from '../../application/events/event.types.js';
import { InMemoryEventDeliveries } from '../../testing/in-memory-event-deliveries.js';
import type { Env } from '../config/env.schema.js';
import { EventDispatcher } from './event-dispatcher.js';

const T0 = new Date('2026-11-12T10:00:00Z');
const later = (ms: number): Date => new Date(T0.getTime() + ms);

// Suscriptor de prueba: recuerda los eventos que aplicó (idempotente por id) y falla las veces que se le pida.
class TestSubscriber implements EventSubscriber {
  readonly applied = new Set<string>();
  calls = 0;
  constructor(
    readonly name: string,
    private failures = 0
  ) {}

  async handle(event: DomainEventRecord): Promise<void> {
    this.calls += 1;
    if (this.failures > 0) {
      this.failures -= 1;
      throw new Error('falla inyectada');
    }
    this.applied.add(event.id);
  }
}

function setup(...subscribers: TestSubscriber[]) {
  const store = new InMemoryEventDeliveries();
  const registry = new EventSubscriberRegistry();
  for (const subscriber of subscribers) registry.register(subscriber);
  const config = { get: () => 'off' } as unknown as ConfigService<Env, true>;
  const dispatcher = new EventDispatcher(store, registry, config);
  const publish = () =>
    store.publish({ type: 'stock.applied', aggregateId: 'v1', payload: {}, occurredAt: T0 });
  return { store, dispatcher, publish };
}

// Pasa el despachador varias veces con el reloj avanzando más que la espera máxima entre intentos.
async function pump(dispatcher: EventDispatcher, passes: number): Promise<void> {
  for (let pass = 1; pass <= passes; pass += 1) await dispatcher.dispatchOnce(later(pass * 60_000));
}

describe('EventDispatcher: entrega', () => {
  it('entrega un evento a cada suscriptor y lo deja ejecutado', async () => {
    const [a, b] = [new TestSubscriber('a'), new TestSubscriber('b')];
    const { store, dispatcher, publish } = setup(a, b);
    await dispatcher.dispatchOnce(T0); // registra los suscriptores
    const id = publish();

    await pump(dispatcher, 3);

    expect([a.applied.has(id), b.applied.has(id)]).toEqual([true, true]);
    expect(await store.stats(later(1_000_000))).toMatchObject({ pending: 0, needsReview: 0 });
  });

  it('un suscriptor que falla no frena al otro', async () => {
    const [bad, good] = [new TestSubscriber('malo', 99), new TestSubscriber('bueno')];
    const { dispatcher, publish } = setup(bad, good);
    await dispatcher.dispatchOnce(T0);
    const id = publish();

    await pump(dispatcher, 2);

    expect(good.applied.has(id)).toBe(true);
    expect(bad.applied.size).toBe(0);
  });
});

describe('EventDispatcher: reintentos', () => {
  it('con dos fallos y una tercera pasada buena queda ejecutada con 3 intentos y un solo efecto', async () => {
    const flaky = new TestSubscriber('flaky', 2);
    const { store, dispatcher, publish } = setup(flaky);
    await dispatcher.dispatchOnce(T0);
    const id = publish();

    await pump(dispatcher, 4);

    expect([flaky.calls, flaky.applied.size, flaky.applied.has(id)]).toEqual([3, 1, true]);
    expect((await store.stats(later(1e7))).pending).toBe(0);
  });

  it('al agotar los intentos queda en necesita revisión y las pasadas siguientes no la intentan', async () => {
    const broken = new TestSubscriber('roto', 99);
    const { store, dispatcher, publish } = setup(broken);
    await dispatcher.dispatchOnce(T0);
    publish();

    await pump(dispatcher, DELIVERY_POLICY.maxAttempts + 3);

    expect(broken.calls).toBe(DELIVERY_POLICY.maxAttempts);
    expect(await store.stats(later(1e7))).toMatchObject({ pending: 0, needsReview: 1 });
  });
});

describe('EventDispatcher: registro y apagado', () => {
  it('un suscriptor registrado después no recibe los eventos anteriores', async () => {
    const early = new TestSubscriber('temprano');
    const { store, dispatcher, publish } = setup(early);
    await dispatcher.dispatchOnce(T0);
    publish();
    const late = new TestSubscriber('tardio');
    const registry = (dispatcher as unknown as { registry: EventSubscriberRegistry }).registry;
    registry.register(late);

    await pump(dispatcher, 3);

    expect([early.applied.size, late.applied.size]).toEqual([1, 0]);
    expect(store.events).toHaveLength(1);
  });
});

describe('EventDispatcher: apagado', () => {
  it('con el despachador apagado los eventos quedan guardados y se entregan al encenderlo', async () => {
    const subscriber = new TestSubscriber('uno');
    const { store, dispatcher, publish } = setup(subscriber);
    await dispatcher.dispatchOnce(T0);
    publish();
    publish();

    expect((await store.stats(T0)).pending).toBe(2);
    dispatcher.onApplicationBootstrap(); // 'off': no arranca ningún ciclo
    expect(subscriber.calls).toBe(0);
    await pump(dispatcher, 3);

    expect(subscriber.applied.size).toBe(2);
  });
});
