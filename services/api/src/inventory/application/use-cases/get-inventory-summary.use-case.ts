import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import type { InventorySummary } from '../dtos/stock.dtos.js';
import { STOCK_QUERY, type StockQueryPort } from '../ports/inventory.ports.js';

@Injectable()
export class GetInventorySummaryUseCase implements UseCase<void, InventorySummary> {
  constructor(@Inject(STOCK_QUERY) private readonly stock: StockQueryPort) {}

  execute(): Promise<InventorySummary> {
    return this.stock.summary();
  }
}
