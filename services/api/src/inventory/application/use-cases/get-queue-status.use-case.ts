import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  STOCK_COMMANDS_REPOSITORY,
  type StockCommandsRepository,
} from '../../domain/stock-commands.repository.port.js';
import type { QueueStatusResult } from '../dtos/stock.dtos.js';
import { CLOCK, type ClockPort } from '../ports/inventory.ports.js';

// Atraso de la cola: cuántos comandos esperan y hace cuánto espera el más viejo.
@Injectable()
export class GetQueueStatusUseCase implements UseCase<void, QueueStatusResult> {
  constructor(
    @Inject(STOCK_COMMANDS_REPOSITORY) private readonly commands: StockCommandsRepository,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(): Promise<QueueStatusResult> {
    const stats = await this.commands.queueStats();
    const oldest = stats.oldestPendingAt;
    const age = oldest
      ? Math.max(0, Math.floor((this.clock.now().getTime() - oldest.getTime()) / 1000))
      : null;
    return { pending: stats.pending, oldestPendingAgeSeconds: age };
  }
}
