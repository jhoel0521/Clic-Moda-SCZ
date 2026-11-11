import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { Product } from '../../domain/entities/product.entity.js';
import { SkuLockedError, VariantNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { VariantId } from '../../domain/value-objects/ids.vo.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import { Color, Size, Sku } from '../../domain/value-objects/variant-attributes.vo.js';
import {
  type ProductResult,
  type UpdateVariantCommand,
  toProductResult,
} from '../dtos/product.dtos.js';
import {
  VARIANT_HAS_MOVEMENTS,
  type VariantHasMovementsPort,
} from '../ports/variant-has-movements.port.js';

@Injectable()
export class UpdateVariantUseCase implements UseCase<UpdateVariantCommand, ProductResult> {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository,
    @Inject(VARIANT_HAS_MOVEMENTS) private readonly movements: VariantHasMovementsPort
  ) {}

  async execute(command: UpdateVariantCommand): Promise<ProductResult> {
    const id = VariantId.of(command.variantId);
    const product = await this.products.findByVariantId(id);
    if (!product) throw new VariantNotFoundError();
    await this.applySku(product, id, command.changes.sku);
    const { size, color, price } = command.changes;
    product.changeVariant(id, {
      size: size === undefined ? undefined : Size.of(size),
      color: color === undefined ? undefined : color === null ? null : Color.of(color),
      price: price === undefined ? undefined : Money.ofDecimal(price),
    });
    await this.products.save(product);
    return toProductResult(product);
  }

  // Un SKU con movimientos de inventario es la identidad de ese stock: no se cambia.
  private async applySku(product: Product, id: VariantId, raw: string | undefined): Promise<void> {
    if (raw === undefined) return;
    const sku = Sku.of(raw);
    if (product.variant(id).sku.equals(sku)) return;
    if (await this.movements.hasMovements(id)) throw new SkuLockedError(sku.value);
    product.changeVariantSku(id, sku);
  }
}
