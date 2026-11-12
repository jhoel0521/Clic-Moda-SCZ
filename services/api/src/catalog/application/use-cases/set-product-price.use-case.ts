import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { ProductId } from '../../domain/value-objects/ids.vo.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { type ProductResult, toProductResult } from '../dtos/product.dtos.js';

export class SetProductPriceCommand {
  constructor(
    readonly productId: string,
    readonly price: string | number
  ) {}
}

// Atajo: aplica el MISMO precio a todas las variantes en una sola operación atómica. Cada variante puede
// tener su propio precio (PATCH de la variante); la tienda lo muestra por variante.
@Injectable()
export class SetProductPriceUseCase implements UseCase<SetProductPriceCommand, ProductResult> {
  constructor(@Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository) {}

  async execute(command: SetProductPriceCommand): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(command.productId));
    if (!product) throw new ProductNotFoundError();
    const price = Money.ofDecimal(command.price);
    for (const variant of product.variants) product.changeVariant(variant.id, { price });
    await this.products.save(product);
    return toProductResult(product);
  }
}
