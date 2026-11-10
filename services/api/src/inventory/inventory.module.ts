import { Module } from '@nestjs/common';
import {
  CLOCK,
  STOCK_COMMAND_PROCESSING,
  STOCK_QUERY,
  VARIANT_LOOKUP,
} from './application/ports/inventory.ports.js';
import { EnqueueStockCommandUseCase } from './application/use-cases/enqueue-stock-command.use-case.js';
import { GetQueueStatusUseCase } from './application/use-cases/get-queue-status.use-case.js';
import { GetStockCommandUseCase } from './application/use-cases/get-stock-command.use-case.js';
import { ListLowStockUseCase } from './application/use-cases/list-low-stock.use-case.js';
import { ListMovementsUseCase } from './application/use-cases/list-movements.use-case.js';
import { ListStockUseCase } from './application/use-cases/list-stock.use-case.js';
import { ProcessNextStockCommandUseCase } from './application/use-cases/process-next-stock-command.use-case.js';
import { UpdateStockSettingsUseCase } from './application/use-cases/update-stock-settings.use-case.js';
import { STOCK_COMMANDS_REPOSITORY } from './domain/stock-commands.repository.port.js';
import { STOCK_LEVELS_REPOSITORY } from './domain/stock-levels.repository.port.js';
import { SystemClock } from './infrastructure/clock/system-clock.js';
import { InventoryCommandsController } from './infrastructure/http/inventory.controller.js';
import { StockController } from './infrastructure/http/stock.controller.js';
import { SqlVariantLookup } from './infrastructure/persistence/sql-variant-lookup.js';
import { TypeOrmStockCommandsRepository } from './infrastructure/persistence/typeorm-stock-commands.repository.js';
import { TypeOrmStockLevelsRepository } from './infrastructure/persistence/typeorm-stock-levels.repository.js';
import { TypeOrmStockProcessingAdapter } from './infrastructure/persistence/typeorm-stock-processing.adapter.js';
import { TypeOrmStockQueries } from './infrastructure/persistence/typeorm-stock-queries.js';
import { StockCommandProcessor } from './infrastructure/queue/stock-command-processor.js';

const USE_CASES = [
  EnqueueStockCommandUseCase,
  ProcessNextStockCommandUseCase,
  GetStockCommandUseCase,
  GetQueueStatusUseCase,
  UpdateStockSettingsUseCase,
  ListStockUseCase,
  ListLowStockUseCase,
  ListMovementsUseCase,
];

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  controllers: [InventoryCommandsController, StockController],
  providers: [
    { provide: STOCK_COMMANDS_REPOSITORY, useClass: TypeOrmStockCommandsRepository },
    { provide: STOCK_LEVELS_REPOSITORY, useClass: TypeOrmStockLevelsRepository },
    { provide: STOCK_COMMAND_PROCESSING, useClass: TypeOrmStockProcessingAdapter },
    { provide: STOCK_QUERY, useClass: TypeOrmStockQueries },
    { provide: VARIANT_LOOKUP, useClass: SqlVariantLookup },
    { provide: CLOCK, useClass: SystemClock },
    StockCommandProcessor,
    ...USE_CASES,
  ],
  exports: [
    ...USE_CASES,
    STOCK_COMMANDS_REPOSITORY,
    STOCK_LEVELS_REPOSITORY,
    STOCK_COMMAND_PROCESSING,
    STOCK_QUERY,
    VARIANT_LOOKUP,
    CLOCK,
  ],
})
export class InventoryModule {}
