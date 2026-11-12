import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { assertPagination } from '../../../shared/application/pagination.js';
import { parseCommandType } from '../../domain/value-objects/command-values.js';
import { TypeCode } from '../../domain/value-objects/type-values.vo.js';
import { VariantId } from '../../domain/value-objects/ids.vo.js';
import type { MovementPage, MovementsQuery } from '../dtos/stock.dtos.js';
import { STOCK_QUERY, type StockQueryPort } from '../ports/inventory.ports.js';

export class ListMovementsQuery {
  constructor(
    readonly variantId: string,
    readonly page: number,
    readonly pageSize: number,
    readonly type?: string,
    readonly from?: Date,
    readonly to?: Date,
    readonly typeCode?: string
  ) {}
}

// Historial de una variante, del más reciente al más antiguo, con filtro por tipo y rango de fechas.
@Injectable()
export class ListMovementsUseCase implements UseCase<ListMovementsQuery, MovementPage> {
  constructor(@Inject(STOCK_QUERY) private readonly stock: StockQueryPort) {}

  async execute(query: ListMovementsQuery): Promise<MovementPage> {
    assertPagination(query.page, query.pageSize);
    const filter: MovementsQuery = {
      page: query.page,
      pageSize: query.pageSize,
      type: query.type ? parseCommandType(query.type) : undefined,
      typeCode: query.typeCode ? TypeCode.of(query.typeCode).value : undefined,
      from: query.from,
      to: query.to,
    };
    return this.stock.listMovements(VariantId.of(query.variantId), filter);
  }
}
