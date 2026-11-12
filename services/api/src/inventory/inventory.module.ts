import { Module } from '@nestjs/common';
import {
  CLOCK,
  STOCK_COMMAND_PROCESSING,
  STOCK_QUERY,
  VARIANT_LOOKUP,
} from './application/ports/inventory.ports.js';
import { CreateMovementTypeUseCase } from './application/use-cases/create-movement-type.use-case.js';
import {
  ListEventDeliveriesInReviewUseCase,
  RetryEventDeliveryUseCase,
} from './application/use-cases/review-event-deliveries.use-cases.js';
import { EnqueueStockCommandUseCase } from './application/use-cases/enqueue-stock-command.use-case.js';
import { GetInventorySummaryUseCase } from './application/use-cases/get-inventory-summary.use-case.js';
import { GetQueueStatusUseCase } from './application/use-cases/get-queue-status.use-case.js';
import { GetStockCommandUseCase } from './application/use-cases/get-stock-command.use-case.js';
import { ListLowStockUseCase } from './application/use-cases/list-low-stock.use-case.js';
import { ListMovementTypesUseCase } from './application/use-cases/list-movement-types.use-case.js';
import { ListMovementsUseCase } from './application/use-cases/list-movements.use-case.js';
import { ListStockUseCase } from './application/use-cases/list-stock.use-case.js';
import { ProcessNextStockCommandUseCase } from './application/use-cases/process-next-stock-command.use-case.js';
import { RenameMovementTypeUseCase } from './application/use-cases/rename-movement-type.use-case.js';
import { SetMovementTypeActiveUseCase } from './application/use-cases/set-movement-type-active.use-case.js';
import { UpdateStockSettingsUseCase } from './application/use-cases/update-stock-settings.use-case.js';
import { MOVEMENT_TYPES_REPOSITORY } from './domain/movement-types.repository.port.js';
import { STOCK_COMMANDS_REPOSITORY } from './domain/stock-commands.repository.port.js';
import { STOCK_LEVELS_REPOSITORY } from './domain/stock-levels.repository.port.js';
import { SystemClock } from './infrastructure/clock/system-clock.js';
import { EventDeliveriesController } from './infrastructure/http/event-deliveries.controller.js';
import { InventoryCommandsController } from './infrastructure/http/inventory.controller.js';
import { MovementTypesController } from './infrastructure/http/movement-types.controller.js';
import { StockController } from './infrastructure/http/stock.controller.js';
import { SqlVariantLookup } from './infrastructure/persistence/sql-variant-lookup.js';
import { TypeOrmMovementTypesRepository } from './infrastructure/persistence/typeorm-movement-types.repository.js';
import { TypeOrmStockCommandsRepository } from './infrastructure/persistence/typeorm-stock-commands.repository.js';
import { TypeOrmStockLevelsRepository } from './infrastructure/persistence/typeorm-stock-levels.repository.js';
import { TypeOrmStockProcessingAdapter } from './infrastructure/persistence/typeorm-stock-processing.adapter.js';
import { TypeOrmStockQueries } from './infrastructure/persistence/typeorm-stock-queries.js';
import { StockCommandProcessor } from './infrastructure/queue/stock-command-processor.js';

const USE_CASES = [
  GetInventorySummaryUseCase,
  EnqueueStockCommandUseCase,
  ProcessNextStockCommandUseCase,
  GetStockCommandUseCase,
  GetQueueStatusUseCase,
  UpdateStockSettingsUseCase,
  ListStockUseCase,
  ListLowStockUseCase,
  ListMovementsUseCase,
  ListMovementTypesUseCase,
  CreateMovementTypeUseCase,
  RenameMovementTypeUseCase,
  SetMovementTypeActiveUseCase,
  ListEventDeliveriesInReviewUseCase,
  RetryEventDeliveryUseCase,
];

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  controllers: [
    InventoryCommandsController,
    StockController,
    MovementTypesController,
    EventDeliveriesController,
  ],
  providers: [
    { provide: STOCK_COMMANDS_REPOSITORY, useClass: TypeOrmStockCommandsRepository },
    { provide: MOVEMENT_TYPES_REPOSITORY, useClass: TypeOrmMovementTypesRepository },
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
    MOVEMENT_TYPES_REPOSITORY,
    STOCK_LEVELS_REPOSITORY,
    STOCK_COMMAND_PROCESSING,
    STOCK_QUERY,
    VARIANT_LOOKUP,
    CLOCK,
  ],
})
export class InventoryModule {}
