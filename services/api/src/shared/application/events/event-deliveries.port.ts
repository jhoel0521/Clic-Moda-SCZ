import type { DomainEventRecord } from './event.types.js';
import type { FailureOutcome } from './delivery-policy.js';

export interface ClaimedDelivery {
  readonly deliveryId: string;
  readonly subscriber: string;
  readonly attempts: number; // ya incluye este intento
  readonly event: DomainEventRecord;
}

export interface DeliveryStats {
  readonly pending: number;
  readonly needsReview: number;
  readonly oldestPendingAgeMs: number | null;
}

export interface DeliverySummary {
  readonly id: string;
  readonly subscriber: string;
  readonly eventType: string;
  readonly attempts: number;
  readonly lastError: string | null;
}

// Entregas de eventos a sus suscriptores. La implementación real (Postgres) y el fake pasan el mismo contrato.
export interface EventDeliveriesPort {
  // Inserción idempotente: un suscriptor nuevo empieza en su registro y no recibe el pasado.
  registerSubscribers(names: readonly string[], now: Date): Promise<void>;
  // Elige la entrega pendiente que le toca, suma el intento y la reserva por `leaseMs` (en una sentencia
  // ya confirmada: si el proceso cae, el intento queda contado). null si no hay nada que entregar.
  claimNext(now: Date, leaseMs: number): Promise<ClaimedDelivery | null>;
  // `false` si ya estaba ejecutada: otra pasada la ejecutó antes y esta queda marcada como duplicada.
  markExecuted(deliveryId: string, now: Date): Promise<boolean>;
  markFailed(deliveryId: string, error: string, outcome: FailureOutcome): Promise<void>;
  stats(now: Date): Promise<DeliveryStats>;
  listNeedsReview(limit: number): Promise<DeliverySummary[]>;
  // Devuelve una entrega en «necesita revisión» a pendiente con los intentos en cero; false si no aplica.
  retry(deliveryId: string, now: Date): Promise<boolean>;
}
export const EVENT_DELIVERIES = Symbol('EventDeliveriesPort');
