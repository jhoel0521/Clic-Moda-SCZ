import type { Product } from '../../domain/entities/product.entity.js';
import type { Variant } from '../../domain/entities/variant.entity.js';

// Entrada de una variante tal como llega de la API: texto y números sin validar.
export interface VariantInput {
  readonly sku?: string | null;
  readonly size: string;
  readonly color?: string | null;
  readonly price: string | number;
}

export class RegisterProductCommand {
  constructor(
    readonly categoryId: string,
    readonly name: string,
    readonly description: string | null | undefined,
    readonly variants: readonly VariantInput[]
  ) {}
}

export class UpdateProductCommand {
  constructor(
    readonly id: string,
    readonly changes: { name?: string; description?: string | null; categoryId?: string }
  ) {}
}

export class SetProductActiveCommand {
  constructor(
    readonly id: string,
    readonly active: boolean
  ) {}
}

export class AddVariantCommand {
  constructor(
    readonly productId: string,
    readonly variant: VariantInput
  ) {}
}

export class UpdateVariantCommand {
  constructor(
    readonly variantId: string,
    readonly changes: {
      sku?: string;
      size?: string;
      color?: string | null;
      price?: string | number;
    }
  ) {}
}

export class SetVariantActiveCommand {
  constructor(
    readonly variantId: string,
    readonly active: boolean
  ) {}
}

export class SearchProductsQuery {
  constructor(
    readonly page: number,
    readonly pageSize: number,
    readonly text?: string,
    readonly categoryId?: string,
    readonly active?: boolean
  ) {}
}

export class GetProductQuery {
  constructor(readonly id: string) {}
}

export interface VariantResult {
  readonly id: string;
  readonly sku: string;
  readonly size: string;
  readonly color: string | null;
  readonly price: string; // "349.90"
  readonly active: boolean;
}

export interface ProductResult {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly description: string | null;
  readonly active: boolean;
  readonly variants: readonly VariantResult[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductPageResult {
  readonly items: readonly ProductResult[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export const toVariantResult = (variant: Variant): VariantResult => ({
  id: variant.id.value,
  sku: variant.sku.value,
  size: variant.size.value,
  color: variant.color?.value ?? null,
  price: variant.price.toDecimal(),
  active: variant.active,
});

export const toProductResult = (product: Product): ProductResult => ({
  id: product.id.value,
  categoryId: product.categoryId.value,
  name: product.name.value,
  description: product.description,
  active: product.active,
  variants: product.variants.map(toVariantResult),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});
