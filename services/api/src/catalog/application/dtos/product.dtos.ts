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

export class SetProductPhotosCommand {
  constructor(
    readonly productId: string,
    readonly mediaIds: readonly string[]
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
    readonly active?: boolean,
    readonly stock?: 'out' | 'in' | 'partial'
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
  // Stock de la variante (solo en los listados de productos).
  readonly available?: number;
  readonly location?: string | null;
  readonly reorderLevel?: number;
}

export interface ProductResult {
  readonly id: string;
  readonly categoryId: string;
  readonly name: string;
  readonly slug: string;
  // Identificadores de las fotos (módulo de imágenes), en orden; la primera es la principal.
  readonly photos: readonly string[];
  readonly description: string | null;
  readonly active: boolean;
  readonly variants: readonly VariantResult[];
  // Unidades disponibles (solo en los listados): suma de las variantes activas.
  readonly available?: number;
  // Variantes activas agotadas (solo en los listados).
  readonly soldOutVariants?: number;
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

export const toProductResult = (
  product: Product,
  photos: readonly string[] = product.photos.ids
): ProductResult => ({
  id: product.id.value,
  categoryId: product.categoryId.value,
  name: product.name.value,
  slug: product.slug.value,
  photos,
  description: product.description,
  active: product.active,
  variants: product.variants.map(toVariantResult),
  createdAt: product.createdAt.toISOString(),
  updatedAt: product.updatedAt.toISOString(),
});
