import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { VariantNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { VariantId } from '../../domain/value-objects/ids.vo.js';
import {
  type ProductResult,
  type SetVariantActiveCommand,
  toProductResult,
} from '../dtos/product.dtos.js';

@Injectable()
export class SetVariantActiveUseCase implements UseCase<SetVariantActiveCommand, ProductResult> {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository) {}

  async execute(command: SetVariantActiveCommand): Promise<ProductResult> {
    const id = VariantId.of(command.variantId);
    const product = await this.products.findByVariantId(id);
    if (!product) throw new VariantNotFoundError();
    product.variant(id).setActive(command.active);
    await this.products.save(product);
    return toProductResult(product);
  }
}
