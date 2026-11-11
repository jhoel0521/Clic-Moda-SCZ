import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../../domain/categories.repository.port.js';
import { CategoryInUseError, CategoryNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { CategoryId } from '../../domain/value-objects/ids.vo.js';
import type { DeleteCategoryCommand } from '../dtos/category.dtos.js';

// Borra solo categorías sin productos (activos o no): así ningún producto queda sin categoría.
@Injectable()
export class DeleteCategoryUseCase implements UseCase<DeleteCategoryCommand, void> {
  constructor(
    @Inject(CATEGORIES_REPOSITORY) private readonly categories: CategoriesRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository
  ) {}

  async execute(command: DeleteCategoryCommand): Promise<void> {
    const id = CategoryId.of(command.id);
    if (!(await this.categories.findById(id))) throw new CategoryNotFoundError();
    if ((await this.products.countByCategory(id)) > 0) throw new CategoryInUseError();
    await this.categories.delete(id);
  }
}
