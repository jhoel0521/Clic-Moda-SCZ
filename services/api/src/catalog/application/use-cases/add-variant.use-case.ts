import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { ProductId } from '../../domain/value-objects/ids.vo.js';
import {
  type AddVariantCommand,
  type ProductResult,
  toProductResult,
} from '../dtos/product.dtos.js';
import { buildVariants } from '../support/variant-builder.js';

@Injectable()
export class AddVariantUseCase implements UseCase<AddVariantCommand, ProductResult> {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository) {}

  async execute(command: AddVariantCommand): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(command.productId));
    if (!product) throw new ProductNotFoundError();
    const taken = product.variants.map((variant) => variant.sku.value);
    const [variant] = await buildVariants(this.products, product.name, [command.variant], taken);
    product.addVariant(variant!);
    await this.products.save(product);
    return toProductResult(product);
  }
}
