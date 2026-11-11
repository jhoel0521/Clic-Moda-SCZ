import type { Category } from '../../domain/entities/category.entity.js';

export class CreateCategoryCommand {
  constructor(readonly name: string) {}
}

export class UpdateCategoryCommand {
  constructor(
    readonly id: string,
    readonly name: string
  ) {}
}

export class DeleteCategoryCommand {
  constructor(readonly id: string) {}
}

export interface CategoryResult {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly active: boolean;
  readonly productCount: number;
}

export const toCategoryResult = (category: Category, productCount: number): CategoryResult => ({
  id: category.id.value,
  name: category.name.value,
  slug: category.slug.value,
  active: category.active,
  productCount,
});
