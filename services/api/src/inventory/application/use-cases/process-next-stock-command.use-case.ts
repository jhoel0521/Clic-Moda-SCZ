import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { StockPolicy } from '../../domain/stock-policy.js';
import { type StockCommandResult, toCommandResult } from '../dtos/stock.dtos.js';
import {
  CLOCK,
  type ClockPort,
  type ProcessOutcome,
  STOCK_COMMAND_PROCESSING,
  type StockCommandProcessingPort,
} from '../ports/inventory.ports.js';

export interface ProcessedResult {
  readonly command: StockCommandResult;
  readonly outcome: ProcessOutcome;
}

// Procesa el siguiente comando pendiente que le toque (null si no hay). La transacción, el reclamo y
// el orden por variante los resuelve el puerto; la decisión de negocio es `StockPolicy`.
@Injectable()
export class ProcessNextStockCommandUseCase implements UseCase<void, ProcessedResult | null> {
  constructor(
    @Inject(STOCK_COMMAND_PROCESSING) private readonly processing: StockCommandProcessingPort,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(): Promise<ProcessedResult | null> {
    const processed = await this.processing.processNext(StockPolicy.decide, this.clock.now());
    return processed
      ? { command: toCommandResult(processed.command), outcome: processed.outcome }
      : null;
  }
}
