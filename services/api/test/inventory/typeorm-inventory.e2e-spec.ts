import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import {
  STOCK_COMMAND_PROCESSING,
  STOCK_QUERY,
  VARIANT_LOOKUP,
} from '../../src/inventory/application/ports/inventory.ports.js';
import type { StockMovement } from '../../src/inventory/domain/entities/stock-movement.entity.js';
import { STOCK_COMMANDS_REPOSITORY } from '../../src/inventory/domain/stock-commands.repository.port.js';
import { STOCK_LEVELS_REPOSITORY } from '../../src/inventory/domain/stock-levels.repository.port.js';
import type { VariantId } from '../../src/inventory/domain/value-objects/ids.vo.js';
import { stockCommandProcessingContract } from '../../src/inventory/testing/stock-command-processing.contract.js';
import { stockCommandsRepositoryContract } from '../../src/inventory/testing/stock-commands-repository.contract.js';
import { stockLevelsRepositoryContract } from '../../src/inventory/testing/stock-levels-repository.contract.js';
import {
  stockQueryContract,
  type VariantInfo,
} from '../../src/inventory/testing/stock-query.contract.js';
import { variantLookupContract } from '../../src/inventory/testing/variant-lookup.contract.js';
import { truncateAll } from '../support/db.js';
import { insertCommandRow, insertVariant, readMovements } from './inventory-sql.js';

interface Ctx {
  module: () => TestingModule;
  db: () => DataSource;
}

const variantFor = (ctx: Ctx, info: Partial<VariantInfo> = {}) =>
  insertVariant(ctx.db(), {
    sku: `SKU-${Math.random().toString(36).slice(2, 8)}`,
    productName: 'Producto',
    ...info,
  });

// Las MISMAS suites que corren contra los fakes en memoria, ahora contra Postgres real.
function queueContracts(ctx: Ctx): void {
  stockCommandsRepositoryContract('TypeORM + Postgres', async () => {
    await truncateAll(ctx.db());
    return {
      commands: ctx.module().get(STOCK_COMMANDS_REPOSITORY),
      newVariant: () => variantFor(ctx),
    };
  });
  stockLevelsRepositoryContract('TypeORM + Postgres', async () => {
    await truncateAll(ctx.db());
    return { levels: ctx.module().get(STOCK_LEVELS_REPOSITORY), newVariant: () => variantFor(ctx) };
  });
}

function processingContracts(ctx: Ctx): void {
  stockCommandProcessingContract('TypeORM + Postgres', async () => {
    await truncateAll(ctx.db());
    return {
      commands: ctx.module().get(STOCK_COMMANDS_REPOSITORY),
      levels: ctx.module().get(STOCK_LEVELS_REPOSITORY),
      processing: ctx.module().get(STOCK_COMMAND_PROCESSING),
      newVariant: () => variantFor(ctx),
      movementsOf: (id: VariantId): Promise<StockMovement[]> => readMovements(ctx.db(), id),
    };
  });
  variantLookupContract('SQL + Postgres', async () => {
    await truncateAll(ctx.db());
    return {
      port: ctx.module().get(VARIANT_LOOKUP),
      newVariant: (active: boolean) => variantFor(ctx, { active }),
    };
  });
}

function queryContract(ctx: Ctx): void {
  stockQueryContract('SQL + Postgres', async () => {
    await truncateAll(ctx.db());
    return {
      query: ctx.module().get(STOCK_QUERY),
      newVariant: (info: VariantInfo) => variantFor(ctx, info),
      setLevel: async (variantId, level) => {
        await ctx
          .db()
          .query(
            'INSERT INTO stock_levels (variant_id, on_hand, reserved, reorder_level, location) VALUES ($1, $2, $3, $4, $5)',
            [
              variantId.value,
              level.onHand,
              level.reserved ?? 0,
              level.reorderLevel ?? 0,
              level.location ?? null,
            ]
          );
      },
      addMovement: (variantId, movement) => insertCommandRow(ctx.db(), variantId, movement),
    };
  });
}

describe('Inventario sobre Postgres (e2e)', () => {
  let moduleRef: TestingModule;
  const ctx: Ctx = { module: () => moduleRef, db: () => moduleRef.get(DataSource) };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  queueContracts(ctx);
  processingContracts(ctx);
  queryContract(ctx);
});
