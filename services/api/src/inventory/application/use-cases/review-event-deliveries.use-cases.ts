import { Inject, Injectable } from '@nestjs/common';
import {
  type DeliverySummary,
  EVENT_DELIVERIES,
  type EventDeliveriesPort,
} from '../../../shared/application/events/event-deliveries.port.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import { NotFoundError } from '../../../shared/domain/errors/domain.error.js';
import { CLOCK, type ClockPort } from '../ports/inventory.ports.js';

const REVIEW_LIMIT = 100;

// Entregas de eventos que agotaron sus intentos, con su último error: las ve el Gerente (solo por la API).
@Injectable()
export class ListEventDeliveriesInReviewUseCase implements UseCase<void, DeliverySummary[]> {
  constructor(@Inject(EVENT_DELIVERIES) private readonly deliveries: EventDeliveriesPort) {}

  execute(): Promise<DeliverySummary[]> {
    return this.deliveries.listNeedsReview(REVIEW_LIMIT);
  }
}

// Reintento manual: devuelve la entrega a pendiente con los intentos en cero.
@Injectable()
export class RetryEventDeliveryUseCase implements UseCase<string, void> {
  constructor(
    @Inject(EVENT_DELIVERIES) private readonly deliveries: EventDeliveriesPort,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(deliveryId: string): Promise<void> {
    const retried = await this.deliveries.retry(deliveryId, this.clock.now());
    if (!retried) throw new NotFoundError('La entrega no existe o no está en revisión');
  }
}
