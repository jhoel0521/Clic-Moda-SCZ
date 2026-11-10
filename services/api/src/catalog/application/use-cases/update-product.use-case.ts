import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../../domain/categories.repository.port.js';
import { CategoryNotFoundError, ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { CategoryId, ProductId } from '../../domain/value-objects/ids.vo.js';
import { ProductName } from '../../domain/value-objects/names.vo.js';
import {
  type ProductResult,
  type UpdateProductCommand,
  toProductResult,
} from '../dtos/product.dtos.js';

@Injectable()
export class UpdateProductUseCase implements UseCase<UpdateProductCommand, ProductResult> {
  constructor(
    @Inject(CATEGORIES_REPOSITORY) private readonly categories: CategoriesRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository
  ) {}

  async execute(command: UpdateProductCommand): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(command.id));
    if (!product) throw new ProductNotFoundError();
    const { name, description, categoryId } = command.changes;
    const category = categoryId ? CategoryId.of(categoryId) : undefined;
    if (category && !(await this.categories.findById(category))) throw new CategoryNotFoundError();
    product.update({
      name: name === undefined ? undefined : ProductName.of(name),
      description,
      categoryId: category,
    });
    await this.products.save(product);
    return toProductResult(product);
  }
}
