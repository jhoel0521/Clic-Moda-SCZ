import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { FailureOutcome } from '../../application/events/delivery-policy.js';
import type {
  ClaimedDelivery,
  DeliveryStats,
  DeliverySummary,
  EventDeliveriesPort,
} from '../../application/events/event-deliveries.port.js';
import type { DomainEventRecord } from '../../application/events/event.types.js';

interface EventRow {
  id: string;
  seq: string; // bigint llega como texto
  type: string;
  aggregate_id: string;
  payload: Record<string, unknown>;
  occurred_at: Date;
}

const toEvent = (row: EventRow): DomainEventRecord => ({
  id: row.id,
  seq: Number(row.seq),
  type: row.type,
  aggregateId: row.aggregate_id,
  payload: row.payload,
  occurredAt: row.occurred_at,
});

// Elige la entrega pendiente que le toca (por antigüedad y luego por orden del evento), suma el intento y la
// reserva hacia adelante, TODO en una sola sentencia que se confirma al instante: si el proceso cae durante
// el efecto, el intento ya está contado y otra pasada la retoma al vencer la reserva.
const CLAIM = `
  WITH next AS (
    SELECT d.id FROM event_deliveries d JOIN domain_events e ON e.id = d.event_id
    WHERE d.status = 'pending' AND d.available_at <= $1
    ORDER BY d.available_at, e.seq LIMIT 1 FOR UPDATE OF d SKIP LOCKED
  )
  UPDATE event_deliveries d SET attempts = d.attempts + 1, available_at = $2
  FROM next WHERE d.id = next.id
  RETURNING d.id, d.subscriber, d.attempts, d.event_id`;

const MAX_ERROR = 2000;

@Injectable()
export class TypeOrmEventDeliveries implements EventDeliveriesPort {
  constructor(private readonly dataSource: DataSource) {}

  async registerSubscribers(names: readonly string[], now: Date): Promise<void> {
    if (names.length === 0) return;
    await this.dataSource.query(
      `INSERT INTO event_subscribers (name, registered_at)
       SELECT unnest($1::text[]), $2 ON CONFLICT (name) DO NOTHING`,
      [names, now]
    );
  }

  async claimNext(now: Date, leaseMs: number): Promise<ClaimedDelivery | null> {
    const lease = new Date(now.getTime() + leaseMs);
    const result = await this.dataSource.query(CLAIM, [now, lease]);
    const claimed = (Array.isArray(result[0]) ? result[0] : result) as {
      id: string;
      subscriber: string;
      attempts: number;
      event_id: string;
    }[];
    if (!claimed[0]) return null;
    const [event]: EventRow[] = await this.dataSource.query(
      'SELECT * FROM domain_events WHERE id = $1',
      [claimed[0].event_id]
    );
    const row = claimed[0];
    return {
      deliveryId: row.id,
      subscriber: row.subscriber,
      attempts: row.attempts,
      event: toEvent(event as EventRow),
    };
  }

  async markExecuted(deliveryId: string, now: Date): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE event_deliveries SET status = 'executed', executed_at = $2
       WHERE id = $1 AND status = 'pending' RETURNING id`,
      [deliveryId, now]
    );
    const updated = (Array.isArray(result[0]) ? result[0] : result) as unknown[];
    if (updated.length > 0) return true;
    await this.dataSource.query(
      `UPDATE event_deliveries SET deduplicated = true WHERE id = $1 AND status = 'executed'`,
      [deliveryId]
    );
    return false;
  }

  async markFailed(deliveryId: string, error: string, outcome: FailureOutcome): Promise<void> {
    await this.dataSource.query(
      `UPDATE event_deliveries
       SET last_error = $2, status = $3, available_at = COALESCE($4, available_at)
       WHERE id = $1 AND status = 'pending'`,
      [deliveryId, error.slice(0, MAX_ERROR), outcome.status, outcome.retryAt]
    );
  }

  async stats(now: Date): Promise<DeliveryStats> {
    const [row] = await this.dataSource.query(
      `SELECT count(*) FILTER (WHERE d.status = 'pending')::int AS pending,
              count(*) FILTER (WHERE d.status = 'needs_review')::int AS needs_review,
              min(e.occurred_at) FILTER (WHERE d.status = 'pending') AS oldest
       FROM event_deliveries d JOIN domain_events e ON e.id = d.event_id`
    );
    const oldest: Date | null = row.oldest;
    return {
      pending: row.pending,
      needsReview: row.needs_review,
      oldestPendingAgeMs: oldest ? Math.max(0, now.getTime() - oldest.getTime()) : null,
    };
  }

  async listNeedsReview(limit: number): Promise<DeliverySummary[]> {
    const rows: {
      id: string;
      subscriber: string;
      type: string;
      attempts: number;
      last_error: string | null;
    }[] = await this.dataSource.query(
      `SELECT d.id, d.subscriber, e.type, d.attempts, d.last_error
       FROM event_deliveries d JOIN domain_events e ON e.id = d.event_id
       WHERE d.status = 'needs_review' ORDER BY e.seq LIMIT $1`,
      [limit]
    );
    return rows.map((row) => ({
      id: row.id,
      subscriber: row.subscriber,
      eventType: row.type,
      attempts: row.attempts,
      lastError: row.last_error,
    }));
  }

  async retry(deliveryId: string, now: Date): Promise<boolean> {
    const result = await this.dataSource.query(
      `UPDATE event_deliveries SET status = 'pending', attempts = 0, available_at = $2
       WHERE id = $1 AND status = 'needs_review' RETURNING id`,
      [deliveryId, now]
    );
    return ((Array.isArray(result[0]) ? result[0] : result) as unknown[]).length > 0;
  }
}
