import type { FailureOutcome } from '../application/events/delivery-policy.js';
import type {
  ClaimedDelivery,
  DeliveryStats,
  DeliverySummary,
  EventDeliveriesPort,
} from '../application/events/event-deliveries.port.js';
import type { DomainEventRecord } from '../application/events/event.types.js';

interface Delivery {
  id: string;
  eventId: string;
  subscriber: string;
  status: 'pending' | 'executed' | 'needs_review';
  attempts: number;
  lastError: string | null;
  availableAt: Date;
  deduplicated: boolean;
}

export interface NewEvent {
  type: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

// Fake en memoria del almacén de eventos: hace lo mismo que `EventOutbox` + `TypeOrmEventDeliveries`
// (las entregas nacen con el evento, una por suscriptor ya registrado).
export class InMemoryEventDeliveries implements EventDeliveriesPort {
  readonly events: DomainEventRecord[] = [];
  private readonly subscribers = new Set<string>();
  private readonly deliveries = new Map<string, Delivery>();
  private counter = 0;

  publish(event: NewEvent): string {
    this.counter += 1;
    const record: DomainEventRecord = { ...event, id: `event-${this.counter}`, seq: this.counter };
    this.events.push(record);
    for (const subscriber of this.subscribers) this.add(record, subscriber);
    return record.id;
  }

  private add(event: DomainEventRecord, subscriber: string): void {
    const id = `delivery-${event.id}-${subscriber}`;
    this.deliveries.set(id, {
      id,
      eventId: event.id,
      subscriber,
      status: 'pending',
      attempts: 0,
      lastError: null,
      availableAt: event.occurredAt,
      deduplicated: false,
    });
  }

  async registerSubscribers(names: readonly string[]): Promise<void> {
    for (const name of names) this.subscribers.add(name);
  }

  async claimNext(now: Date, leaseMs: number): Promise<ClaimedDelivery | null> {
    const ready = [...this.deliveries.values()]
      .filter((d) => d.status === 'pending' && d.availableAt <= now)
      .sort(
        (a, b) => a.availableAt.getTime() - b.availableAt.getTime() || this.seqOf(a) - this.seqOf(b)
      );
    const next = ready[0];
    if (!next) return null;
    next.attempts += 1;
    next.availableAt = new Date(now.getTime() + leaseMs);
    const event = this.events.find((e) => e.id === next.eventId) as DomainEventRecord;
    return { deliveryId: next.id, subscriber: next.subscriber, attempts: next.attempts, event };
  }

  private seqOf(delivery: Delivery): number {
    return this.events.find((e) => e.id === delivery.eventId)?.seq ?? 0;
  }

  async markExecuted(deliveryId: string): Promise<boolean> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery) return false;
    if (delivery.status === 'executed') {
      delivery.deduplicated = true;
      return false;
    }
    delivery.status = 'executed';
    return true;
  }

  async markFailed(deliveryId: string, error: string, outcome: FailureOutcome): Promise<void> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery || delivery.status !== 'pending') return;
    delivery.lastError = error;
    delivery.status = outcome.status;
    if (outcome.retryAt) delivery.availableAt = outcome.retryAt;
  }

  async stats(now: Date): Promise<DeliveryStats> {
    const all = [...this.deliveries.values()];
    const pending = all.filter((d) => d.status === 'pending');
    const times = pending.map(
      (d) => this.events.find((e) => e.id === d.eventId)?.occurredAt.getTime() ?? 0
    );
    return {
      pending: pending.length,
      needsReview: all.filter((d) => d.status === 'needs_review').length,
      oldestPendingAgeMs: times.length ? Math.max(0, now.getTime() - Math.min(...times)) : null,
    };
  }

  async listNeedsReview(limit: number): Promise<DeliverySummary[]> {
    return [...this.deliveries.values()]
      .filter((d) => d.status === 'needs_review')
      .slice(0, limit)
      .map((d) => ({
        id: d.id,
        subscriber: d.subscriber,
        eventType: this.events.find((e) => e.id === d.eventId)?.type ?? '',
        attempts: d.attempts,
        lastError: d.lastError,
      }));
  }

  async retry(deliveryId: string, now: Date): Promise<boolean> {
    const delivery = this.deliveries.get(deliveryId);
    if (!delivery || delivery.status !== 'needs_review') return false;
    Object.assign(delivery, { status: 'pending', attempts: 0, availableAt: now });
    return true;
  }
}
