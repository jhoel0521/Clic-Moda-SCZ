import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../../domain/categories.repository.port.js';
import {
  CategoryNotFoundError,
  DuplicateCategoryError,
} from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { CategoryId } from '../../domain/value-objects/ids.vo.js';
import { CategoryName } from '../../domain/value-objects/names.vo.js';
import {
  type CategoryResult,
  type UpdateCategoryCommand,
  toCategoryResult,
} from '../dtos/category.dtos.js';

@Injectable()
export class UpdateCategoryUseCase implements UseCase<UpdateCategoryCommand, CategoryResult> {
  constructor(
    @Inject(CATEGORIES_REPOSITORY) private readonly categories: CategoriesRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository
  ) {}

  async execute(command: UpdateCategoryCommand): Promise<CategoryResult> {
    const category = await this.categories.findById(CategoryId.of(command.id));
    if (!category) throw new CategoryNotFoundError();
    const name = CategoryName.of(command.name);
    const sameName = await this.categories.findByName(name);
    if (sameName && !sameName.id.equals(category.id)) throw new DuplicateCategoryError(name.value);
    category.rename(name);
    await this.categories.save(category);
    return toCategoryResult(category, await this.products.countByCategory(category.id));
  }
}
