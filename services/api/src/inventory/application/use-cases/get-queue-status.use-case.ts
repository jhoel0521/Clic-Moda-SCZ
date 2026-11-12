import { Inject, Injectable } from '@nestjs/common';
import {
  EVENT_DELIVERIES,
  type EventDeliveriesPort,
} from '../../../shared/application/events/event-deliveries.port.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  STOCK_COMMANDS_REPOSITORY,
  type StockCommandsRepository,
} from '../../domain/stock-commands.repository.port.js';
import type { QueueStatusResult } from '../dtos/stock.dtos.js';
import { CLOCK, type ClockPort } from '../ports/inventory.ports.js';

const seconds = (ms: number | null): number | null => (ms === null ? null : Math.floor(ms / 1000));

// Atraso de la cola: cuántos comandos esperan y hace cuánto espera el más viejo, y lo mismo para las
// entregas de eventos (pendientes, en revisión y la antigüedad de la pendiente más antigua).
@Injectable()
export class GetQueueStatusUseCase implements UseCase<void, QueueStatusResult> {
  constructor(
    @Inject(STOCK_COMMANDS_REPOSITORY) private readonly commands: StockCommandsRepository,
    @Inject(EVENT_DELIVERIES) private readonly deliveries: EventDeliveriesPort,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(): Promise<QueueStatusResult> {
    const now = this.clock.now();
    const stats = await this.commands.queueStats();
    const oldest = stats.oldestPendingAt;
    const events = await this.deliveries.stats(now);
    return {
      pending: stats.pending,
      oldestPendingAgeSeconds: oldest
        ? seconds(Math.max(0, now.getTime() - oldest.getTime()))
        : null,
      events: {
        pending: events.pending,
        needsReview: events.needsReview,
        oldestPendingAgeSeconds: seconds(events.oldestPendingAgeMs),
      },
    };
  }
}
