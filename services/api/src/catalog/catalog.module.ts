import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VARIANT_HAS_MOVEMENTS } from './application/ports/variant-has-movements.port.js';
import { AddVariantUseCase } from './application/use-cases/add-variant.use-case.js';
import { CreateCategoryUseCase } from './application/use-cases/create-category.use-case.js';
import { DeleteCategoryUseCase } from './application/use-cases/delete-category.use-case.js';
import { GetProductUseCase } from './application/use-cases/get-product.use-case.js';
import { ListCategoriesUseCase } from './application/use-cases/list-categories.use-case.js';
import { RegisterProductUseCase } from './application/use-cases/register-product.use-case.js';
import { SearchProductsUseCase } from './application/use-cases/search-products.use-case.js';
import { SetProductActiveUseCase } from './application/use-cases/set-product-active.use-case.js';
import { SetVariantActiveUseCase } from './application/use-cases/set-variant-active.use-case.js';
import { UpdateCategoryUseCase } from './application/use-cases/update-category.use-case.js';
import { UpdateProductUseCase } from './application/use-cases/update-product.use-case.js';
import { UpdateVariantUseCase } from './application/use-cases/update-variant.use-case.js';
import { CategoriesController } from './infrastructure/http/categories.controller.js';
import { ProductsController } from './infrastructure/http/products.controller.js';
import { VariantsController } from './infrastructure/http/variants.controller.js';
import { CATEGORIES_REPOSITORY } from './domain/categories.repository.port.js';
import { PRODUCTS_REPOSITORY } from './domain/products.repository.port.js';
import { CategoryOrmEntity } from './infrastructure/persistence/category.orm-entity.js';
import { ProductOrmEntity } from './infrastructure/persistence/product.orm-entity.js';
import { SqlVariantHasMovements } from './infrastructure/persistence/sql-variant-has-movements.js';
import { TypeOrmCategoriesRepository } from './infrastructure/persistence/typeorm-categories.repository.js';
import { TypeOrmProductsRepository } from './infrastructure/persistence/typeorm-products.repository.js';
import { VariantOrmEntity } from './infrastructure/persistence/variant.orm-entity.js';

const USE_CASES = [
  CreateCategoryUseCase,
  UpdateCategoryUseCase,
  DeleteCategoryUseCase,
  ListCategoriesUseCase,
  RegisterProductUseCase,
  UpdateProductUseCase,
  SetProductActiveUseCase,
  AddVariantUseCase,
  UpdateVariantUseCase,
  SetVariantActiveUseCase,
  SearchProductsUseCase,
  GetProductUseCase,
];

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  imports: [TypeOrmModule.forFeature([CategoryOrmEntity, ProductOrmEntity, VariantOrmEntity])],
  controllers: [CategoriesController, ProductsController, VariantsController],
  providers: [
    { provide: CATEGORIES_REPOSITORY, useClass: TypeOrmCategoriesRepository },
    { provide: PRODUCTS_REPOSITORY, useClass: TypeOrmProductsRepository },
    { provide: VARIANT_HAS_MOVEMENTS, useClass: SqlVariantHasMovements },
    ...USE_CASES,
  ],
  exports: [...USE_CASES, CATEGORIES_REPOSITORY, PRODUCTS_REPOSITORY],
})
export class CatalogModule {}
