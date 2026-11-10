import { Controller, Get, Param, Query } from '@nestjs/common';
import { Roles } from '../../../identity/infrastructure/http/roles.decorator.js';
import { GetInventorySummaryUseCase } from '../../application/use-cases/get-inventory-summary.use-case.js';
import { ListLowStockUseCase } from '../../application/use-cases/list-low-stock.use-case.js';
import {
  ListMovementsQuery,
  ListMovementsUseCase,
} from '../../application/use-cases/list-movements.use-case.js';
import { ListStockUseCase } from '../../application/use-cases/list-stock.use-case.js';
import {
  type MovementPageResponseDto,
  type MovementsQueryDto,
  movementsQuerySchema,
  parseDate,
  type StockPageResponseDto,
  type StockQueryDto,
  stockQuerySchema,
  toMovementPageResponse,
  toStockPageResponse,
} from './inventory.dto.js';

// Lecturas del almacén: todo el personal puede consultarlas.
@Controller('inventory')
export class StockController {
  constructor(
    private readonly listStock: ListStockUseCase,
    private readonly listLow: ListLowStockUseCase,
    private readonly listMovements: ListMovementsUseCase,
    private readonly inventorySummary: GetInventorySummaryUseCase
  ) {}

  // Indicadores de la cabecera: modelos, unidades, variantes agotadas y con stock bajo.
  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get('summary')
  summary() {
    return this.inventorySummary.execute();
  }

  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get('stock')
  async stock(
    @Query({ schema: stockQuerySchema }) q: StockQueryDto
  ): Promise<StockPageResponseDto> {
    return toStockPageResponse(await this.listStock.execute(q));
  }

  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get('stock/low')
  async low(@Query({ schema: stockQuerySchema }) q: StockQueryDto): Promise<StockPageResponseDto> {
    return toStockPageResponse(await this.listLow.execute(q));
  }

  @Roles('GERENTE', 'DESPACHO', 'ATENCION')
  @Get('variants/:id/movements')
  async movements(
    @Param('id') id: string,
    @Query({ schema: movementsQuerySchema }) q: MovementsQueryDto
  ): Promise<MovementPageResponseDto> {
    const query = new ListMovementsQuery(
      id,
      q.page,
      q.pageSize,
      q.type,
      parseDate(q.from),
      parseDate(q.to)
    );
    return toMovementPageResponse(await this.listMovements.execute(query));
  }
}
