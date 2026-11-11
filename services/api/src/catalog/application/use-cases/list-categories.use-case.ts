import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../../domain/categories.repository.port.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { type CategoryResult, toCategoryResult } from '../dtos/category.dtos.js';

@Injectable()
export class ListCategoriesUseCase implements UseCase<void, CategoryResult[]> {
  constructor(
    @Inject(CATEGORIES_REPOSITORY) private readonly categories: CategoriesRepository,
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository
  ) {}

  async execute(): Promise<CategoryResult[]> {
    const all = await this.categories.list();
    return Promise.all(
      all.map(async (category) =>
        toCategoryResult(category, await this.products.countByCategory(category.id))
      )
    );
  }
}
