import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  CATEGORIES_REPOSITORY,
  type CategoriesRepository,
} from '../../domain/categories.repository.port.js';
import { Category } from '../../domain/entities/category.entity.js';
import { DuplicateCategoryError } from '../../domain/errors/catalog.errors.js';
import { CategoryName } from '../../domain/value-objects/names.vo.js';
import {
  type CategoryResult,
  type CreateCategoryCommand,
  toCategoryResult,
} from '../dtos/category.dtos.js';

@Injectable()
export class CreateCategoryUseCase implements UseCase<CreateCategoryCommand, CategoryResult> {
  constructor(@Inject(CATEGORIES_REPOSITORY) private readonly categories: CategoriesRepository) {}

  async execute(command: CreateCategoryCommand): Promise<CategoryResult> {
    const name = CategoryName.of(command.name);
    if (await this.categories.findByName(name)) throw new DuplicateCategoryError(name.value);
    const category = Category.create(name);
    await this.categories.save(category);
    return toCategoryResult(category, 0);
  }
}
