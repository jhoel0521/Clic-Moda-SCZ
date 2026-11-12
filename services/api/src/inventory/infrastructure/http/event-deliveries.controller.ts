import { Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import type { DeliverySummary } from '../../../shared/application/events/event-deliveries.port.js';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import {
  ListEventDeliveriesInReviewUseCase,
  RetryEventDeliveryUseCase,
} from '../../application/use-cases/review-event-deliveries.use-cases.js';

// Entregas de eventos que necesitan revisión: solo el Gerente las ve y las reintenta (por ahora solo por la API).
@Controller('inventory/event-deliveries')
export class EventDeliveriesController {
  constructor(
    private readonly inReview: ListEventDeliveriesInReviewUseCase,
    private readonly retryDelivery: RetryEventDeliveryUseCase
  ) {}

  @Roles('GERENTE')
  @Get()
  list(): Promise<DeliverySummary[]> {
    return this.inReview.execute();
  }

  @Roles('GERENTE')
  @Post(':id/retry')
  @HttpCode(HttpStatus.NO_CONTENT)
  async retry(@Param('id') id: string): Promise<void> {
    await this.retryDelivery.execute(id);
  }
}
