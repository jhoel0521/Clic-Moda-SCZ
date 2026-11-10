import { Inject, Injectable } from '@nestjs/common';
import { assertPagination } from '../../../shared/application/pagination.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import type { StockPage, StockQuery } from '../dtos/stock.dtos.js';
import { STOCK_QUERY, type StockQueryPort } from '../ports/inventory.ports.js';

// Stock por variante (físico, reservado, disponible, ubicación y umbral), paginado y con búsqueda.
@Injectable()
export class ListStockUseCase implements UseCase<StockQuery, StockPage> {
  constructor(@Inject(STOCK_QUERY) private readonly stock: StockQueryPort) {}

  async execute(query: StockQuery): Promise<StockPage> {
    assertPagination(query.page, query.pageSize);
    return this.stock.listStock({ ...query, text: query.text?.trim() || undefined });
  }
}
