import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

export interface PublishableEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly occurredAt: Date;
}

// Guarda un evento en la MISMA transacción que el cambio que lo origina (el `EntityManager` es el de esa
// transacción): existen los dos o ninguno. Crea también una entrega por cada suscriptor registrado en ese
// momento, de modo que un suscriptor nuevo empieza en su registro y no hay ningún cursor que pueda saltarse
// eventos cuando varias instancias confirman a la vez.
@Injectable()
export class EventOutbox {
  async publish(manager: EntityManager, event: PublishableEvent): Promise<string> {
    const id = randomUUID();
    await manager.query(
      `INSERT INTO domain_events (id, type, aggregate_id, payload, occurred_at)
       VALUES ($1, $2, $3, $4::jsonb, $5)`,
      [id, event.type, event.aggregateId, JSON.stringify(event.payload), event.occurredAt]
    );
    await manager.query(
      `INSERT INTO event_deliveries (event_id, subscriber, available_at)
       SELECT $1, name, $2 FROM event_subscribers`,
      [id, event.occurredAt]
    );
    return id;
  }
}
