import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { ProductId } from '../../domain/value-objects/ids.vo.js';
import { type GetProductQuery, type ProductResult, toProductResult } from '../dtos/product.dtos.js';

@Injectable()
export class GetProductUseCase implements UseCase<GetProductQuery, ProductResult> {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository) {}

  async execute(query: GetProductQuery): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(query.id));
    if (!product) throw new ProductNotFoundError();
    return toProductResult(product);
  }
}
