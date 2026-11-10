import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { ProductId } from '../../domain/value-objects/ids.vo.js';
import {
  type ProductResult,
  type SetProductActiveCommand,
  toProductResult,
} from '../dtos/product.dtos.js';

// Los productos nunca se borran: se desactivan y conservan sus variantes y su historial.
@Injectable()
export class SetProductActiveUseCase implements UseCase<SetProductActiveCommand, ProductResult> {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository) {}

  async execute(command: SetProductActiveCommand): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(command.id));
    if (!product) throw new ProductNotFoundError();
    product.setActive(command.active);
    await this.products.save(product);
    return toProductResult(product);
  }
}
