import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { VARIANT_HAS_MOVEMENTS } from '../../src/catalog/application/ports/variant-has-movements.port.js';
import { CATEGORIES_REPOSITORY } from '../../src/catalog/domain/categories.repository.port.js';
import { Category } from '../../src/catalog/domain/entities/category.entity.js';
import { Product } from '../../src/catalog/domain/entities/product.entity.js';
import { Variant } from '../../src/catalog/domain/entities/variant.entity.js';
import { PRODUCTS_REPOSITORY } from '../../src/catalog/domain/products.repository.port.js';
import { Money } from '../../src/catalog/domain/value-objects/money.vo.js';
import { CategoryName, ProductName } from '../../src/catalog/domain/value-objects/names.vo.js';
import { Size, Sku } from '../../src/catalog/domain/value-objects/variant-attributes.vo.js';
import { categoriesRepositoryContract } from '../../src/catalog/testing/categories-repository.contract.js';
import {
  type ProductsWorld,
  productsRepositoryContract,
} from '../../src/catalog/testing/products-repository.contract.js';
import {
  type MovementsWorld,
  variantHasMovementsContract,
} from '../../src/catalog/testing/variant-has-movements.contract.js';
import { truncateAll } from '../support/db.js';

async function insertCommand(dataSource: DataSource, variantId: string): Promise<void> {
  await dataSource.query(
    `INSERT INTO stock_commands (id, variant_id, type, quantity, reason, operator, request_hash, type_code)
     VALUES (gen_random_uuid(), $1, 'RECEIVE', 5, 'prueba', 'op', repeat('a', 64), 'RECEIVE')`,
    [variantId]
  );
}

// Crea una categoría, un producto y una variante reales en la base y devuelve el id de la variante.
async function createVariant(moduleRef: TestingModule): Promise<Variant> {
  const category = Category.create(CategoryName.of('Botas'));
  await moduleRef.get(CATEGORIES_REPOSITORY).save(category);
  const variant = Variant.create({
    sku: Sku.of('B-1'),
    size: Size.of('38'),
    color: null,
    price: Money.ofDecimal('100'),
  });
  const name = ProductName.of('Bota');
  await moduleRef
    .get(PRODUCTS_REPOSITORY)
    .save(Product.register({ categoryId: category.id, name }, [variant]));
  return variant;
}

function movementsWorld(moduleRef: TestingModule): MovementsWorld {
  return {
    port: moduleRef.get(VARIANT_HAS_MOVEMENTS),
    newVariant: async ({ withMovement }) => {
      const variant = await createVariant(moduleRef);
      if (withMovement) await insertCommand(moduleRef.get(DataSource), variant.id.value);
      return variant.id;
    },
  };
}

const SET_STOCK =
  'INSERT INTO stock_levels (variant_id, on_hand) VALUES ($1, $2) ON CONFLICT (variant_id) DO UPDATE SET on_hand = $2';

function productsWorld(moduleRef: TestingModule): ProductsWorld {
  return {
    categories: moduleRef.get(CATEGORIES_REPOSITORY),
    products: moduleRef.get(PRODUCTS_REPOSITORY),
    setAvailable: async (variantId, units) => {
      await moduleRef.get(DataSource).query(SET_STOCK, [variantId.value, units]);
    },
  };
}

describe('Catálogo sobre Postgres (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  const reset = () => truncateAll(moduleRef.get(DataSource));

  // Las MISMAS suites que corren contra los fakes en memoria, ahora contra Postgres real.
  categoriesRepositoryContract('TypeORM + Postgres', async () => {
    await reset();
    return moduleRef.get(CATEGORIES_REPOSITORY);
  });

  productsRepositoryContract('TypeORM + Postgres', async () => {
    await reset();
    return productsWorld(moduleRef);
  });

  variantHasMovementsContract('SQL + Postgres', async () => {
    await reset();
    return movementsWorld(moduleRef);
  });
});
