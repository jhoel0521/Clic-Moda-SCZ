import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterFailure, DELIVERY_POLICY } from '../../application/events/delivery-policy.js';
import {
  type ClaimedDelivery,
  EVENT_DELIVERIES,
  type EventDeliveriesPort,
} from '../../application/events/event-deliveries.port.js';
import { EventSubscriberRegistry } from '../../application/events/event-subscriber.registry.js';
import type { Env } from '../config/env.schema.js';

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Entrega los eventos a sus suscriptores mientras la API está viva (como el procesador de la cola de stock).
// EVENT_DISPATCHER=off lo apaga: los eventos quedan guardados y se entregan al encenderlo. Cada entrega se
// reclama con un intento ya contado; un fallo reprograma con espera creciente y, al agotar los intentos,
// pasa a «necesita revisión». Un suscriptor que falla no frena a los demás (cada uno tiene su entrega).
@Injectable()
export class EventDispatcher implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(EventDispatcher.name);
  private running = false;
  private loop: Promise<void> | null = null;

  constructor(
    @Inject(EVENT_DELIVERIES) private readonly deliveries: EventDeliveriesPort,
    private readonly registry: EventSubscriberRegistry,
    private readonly config: ConfigService<Env, true>
  ) {}

  onApplicationBootstrap(): void {
    if (this.config.get('EVENT_DISPATCHER', { infer: true }) === 'off') return;
    this.running = true;
    this.loop = this.run();
  }

  async onApplicationShutdown(): Promise<void> {
    this.running = false;
    await this.loop;
  }

  // Una pasada: registra los suscriptores (idempotente) y entrega UNA entrega si hay. true si trabajó.
  async dispatchOnce(now: Date = new Date()): Promise<boolean> {
    await this.deliveries.registerSubscribers(this.registry.names(), now);
    const claimed = await this.deliveries.claimNext(now, DELIVERY_POLICY.leaseMs);
    if (!claimed) return false;
    await this.deliver(claimed, now);
    return true;
  }

  private async deliver(claimed: ClaimedDelivery, now: Date): Promise<void> {
    try {
      const subscriber = this.registry.find(claimed.subscriber);
      if (!subscriber) throw new Error(`No hay un suscriptor llamado "${claimed.subscriber}"`);
      await subscriber.handle(claimed.event);
    } catch (error) {
      const outcome = afterFailure(claimed.attempts, now);
      await this.deliveries.markFailed(claimed.deliveryId, String(error), outcome);
      return;
    }
    await this.deliveries.markExecuted(claimed.deliveryId, new Date());
  }

  private async run(): Promise<void> {
    const pollMs = this.config.get('EVENT_DISPATCH_POLL_MS', { infer: true });
    while (this.running) {
      const worked = await this.tick();
      if (!worked && this.running) await sleep(pollMs);
    }
  }

  private async tick(): Promise<boolean> {
    try {
      return await this.dispatchOnce();
    } catch (error) {
      this.logger.error(`Fallo al entregar eventos: ${String(error)}`);
      await sleep(1000);
      return false;
    }
  }
}
