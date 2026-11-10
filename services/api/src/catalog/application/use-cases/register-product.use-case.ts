import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../../domain/categories.repository.port.js';
import { Product } from '../../domain/entities/product.entity.js';
import { CategoryNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { CategoryId } from '../../domain/value-objects/ids.vo.js';
import { ProductName } from '../../domain/value-objects/names.vo.js';
import {
  type ProductResult,
  type RegisterProductCommand,
  toProductResult,
} from '../dtos/product.dtos.js';
import { buildVariants } from '../support/variant-builder.js';

// Registra un producto con sus variantes de forma atómica: si algo es inválido no se guarda nada.
@Injectable()
export class RegisterProductUseCase implements UseCase<RegisterProductCommand, ProductResult> {
  constructor(
    @Inject(CATEGORIES_REPOSITORY) private readonly categories: CategoriesRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository
  ) {}

  async execute(command: RegisterProductCommand): Promise<ProductResult> {
    const categoryId = CategoryId.of(command.categoryId);
    if (!(await this.categories.findById(categoryId))) throw new CategoryNotFoundError();
    const name = ProductName.of(command.name);
    const variants = await buildVariants(this.products, name, command.variants);
    const product = Product.register(
      { categoryId, name, description: command.description },
      variants
    );
    await this.products.save(product);
    return toProductResult(product);
  }
}
