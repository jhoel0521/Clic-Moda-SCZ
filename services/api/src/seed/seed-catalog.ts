import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module.js';
import type { INestApplicationContext } from '@nestjs/common';
import {
  type CategoryResult,
  CreateCategoryCommand,
} from '../catalog/application/dtos/category.dtos.js';
import {
  type ProductResult,
  RegisterProductCommand,
  SearchProductsQuery,
} from '../catalog/application/dtos/product.dtos.js';
import { CreateCategoryUseCase } from '../catalog/application/use-cases/create-category.use-case.js';
import { ListCategoriesUseCase } from '../catalog/application/use-cases/list-categories.use-case.js';
import { RegisterProductUseCase } from '../catalog/application/use-cases/register-product.use-case.js';
import { SearchProductsUseCase } from '../catalog/application/use-cases/search-products.use-case.js';
import {
  EnqueueStockCommand,
  UpdateStockSettingsCommand,
} from '../inventory/application/dtos/stock.dtos.js';
import { EnqueueStockCommandUseCase } from '../inventory/application/use-cases/enqueue-stock-command.use-case.js';
import { ProcessNextStockCommandUseCase } from '../inventory/application/use-cases/process-next-stock-command.use-case.js';
import { UpdateStockSettingsUseCase } from '../inventory/application/use-cases/update-stock-settings.use-case.js';
import { StoreSettings } from '../settings/domain/entities/store-settings.entity.js';
import {
  STORE_SETTINGS_REPOSITORY,
  type StoreSettingsRepository,
} from '../settings/domain/store-settings.repository.port.js';
import { DEMO_CATEGORIES, DEMO_PRODUCTS, type DemoProduct } from './demo-catalog.data.js';

// Datos de demostración (los de la demo aprobada). Idempotente: se puede ejecutar varias veces sin
// duplicar nada (categorías y productos se buscan por nombre y el stock usa claves de idempotencia).
const OPERATOR = 'seed';
const WAREHOUSE = 'Almacén principal';

async function ensureCategories(
  app: INestApplicationContext
): Promise<Map<string, CategoryResult>> {
  const existing = await app.get(ListCategoriesUseCase).execute();
  const byName = new Map(existing.map((category) => [category.name, category]));
  for (const name of DEMO_CATEGORIES) {
    if (byName.has(name)) continue;
    byName.set(name, await app.get(CreateCategoryUseCase).execute(new CreateCategoryCommand(name)));
  }
  return byName;
}

async function findProduct(
  app: INestApplicationContext,
  name: string
): Promise<ProductResult | undefined> {
  const page = await app.get(SearchProductsUseCase).execute(new SearchProductsQuery(1, 100, name));
  return page.items.find((product) => product.name === name);
}

async function ensureProduct(
  app: INestApplicationContext,
  demo: DemoProduct,
  categories: Map<string, CategoryResult>
): Promise<ProductResult> {
  const found = await findProduct(app, demo.name);
  if (found) return found;
  const category = categories.get(demo.category) as CategoryResult;
  const variants = demo.variants.map(({ size, color, price }) => ({ size, color, price }));
  return app
    .get(RegisterProductUseCase)
    .execute(new RegisterProductCommand(category.id, demo.name, demo.description, variants));
}

// El stock entra por la MISMA cola que usará el admin; la clave de idempotencia evita duplicarlo.
async function receiveStock(
  app: INestApplicationContext,
  demo: DemoProduct,
  product: ProductResult
): Promise<void> {
  for (const variant of product.variants) {
    const wanted = demo.variants.find((v) => v.size === variant.size && v.color === variant.color);
    if (!wanted || wanted.stock === 0) continue;
    const command = new EnqueueStockCommand(
      variant.id,
      'RECEIVE',
      wanted.stock,
      'Stock inicial de demostración',
      OPERATOR,
      `seed-demo:${variant.id}`
    );
    await app.get(EnqueueStockCommandUseCase).execute(command);
  }
}

async function locate(
  app: INestApplicationContext,
  demo: DemoProduct,
  product: ProductResult,
  index: number
): Promise<void> {
  const shelf = `${demo.category.charAt(0)}${index + 1}`;
  const reorder = demo.category === 'Accesorios' ? 5 : 2;
  for (const variant of product.variants) {
    const where = `${WAREHOUSE} · Estante ${shelf}`;
    await app
      .get(UpdateStockSettingsUseCase)
      .execute(new UpdateStockSettingsCommand(variant.id, where, reorder));
  }
}

// La tienda arranca con la marca provisional "Clic Moda SC"; si el Gerente ya guardó la suya, no se toca.
async function ensureStoreSettings(app: INestApplicationContext): Promise<boolean> {
  const repo = app.get<StoreSettingsRepository>(STORE_SETTINGS_REPOSITORY);
  if (await repo.find()) return false;
  await repo.save(StoreSettings.seed());
  return true;
}

async function drain(app: INestApplicationContext): Promise<number> {
  let processed = 0;
  while (await app.get(ProcessNextStockCommandUseCase).execute()) processed += 1;
  return processed;
}

async function main(): Promise<void> {
  process.env.STOCK_QUEUE_WORKER = 'off'; // el seed procesa la cola él mismo
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const categories = await ensureCategories(app);
    for (const [index, demo] of DEMO_PRODUCTS.entries()) {
      const product = await ensureProduct(app, demo, categories);
      await locate(app, demo, product, index);
      await receiveStock(app, demo, product);
    }
    const processed = await drain(app);
    const created = await ensureStoreSettings(app);
    console.log(
      created ? 'Configuración inicial de la tienda creada.' : 'La tienda ya tenía configuración.'
    );
    console.log(
      `Demo lista: ${DEMO_CATEGORIES.length} categorías, ${DEMO_PRODUCTS.length} productos, ${processed} movimientos de stock aplicados.`
    );
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
