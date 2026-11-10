import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ValidationError } from '../../../shared/domain/errors/domain.error.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { CategoryId } from '../../domain/value-objects/ids.vo.js';
import {
  type ProductPageResult,
  type SearchProductsQuery,
  toProductResult,
} from '../dtos/product.dtos.js';

const MAX_PAGE_SIZE = 100;

@Injectable()
export class SearchProductsUseCase implements UseCase<SearchProductsQuery, ProductPageResult> {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository) {}

  async execute(query: SearchProductsQuery): Promise<ProductPageResult> {
    const { page, pageSize } = query;
    if (!Number.isInteger(page) || page < 1)
      throw new ValidationError('La página debe ser 1 o más');
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > MAX_PAGE_SIZE) {
      throw new ValidationError(`El tamaño de página debe estar entre 1 y ${MAX_PAGE_SIZE}`);
    }
    const found = await this.products.search({
      page,
      pageSize,
      text: query.text?.trim() || undefined,
      categoryId: query.categoryId ? CategoryId.of(query.categoryId) : undefined,
      active: query.active,
    });
    return { items: found.items.map(toProductResult), total: found.total, page, pageSize };
  }
}
