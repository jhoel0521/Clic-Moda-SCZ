import { z } from 'zod';
import type {
  ProductPageResult,
  ProductResult,
  VariantResult,
} from '../../application/dtos/product.dtos.js';

// DTOs de petición HTTP: único lugar donde se valida el formato de transporte. Las reglas de
// negocio (límites de nombre, SKU, precio...) las validan los objetos de valor del dominio.
const price = z.union([z.string().max(20), z.number()]);

export const variantRequestSchema = z.object({
  sku: z.string().max(80).nullish(),
  size: z.string().max(40),
  color: z.string().max(60).nullish(),
  price,
});
export type VariantRequestDto = z.infer<typeof variantRequestSchema>;

export const registerProductSchema = z.object({
  categoryId: z.string().max(60),
  name: z.string().max(300),
  description: z.string().max(5000).nullish(),
  variants: z.array(variantRequestSchema).min(1).max(100),
});
export type RegisterProductDto = z.infer<typeof registerProductSchema>;

export const updateProductSchema = z.object({
  name: z.string().max(300).optional(),
  description: z.string().max(5000).nullable().optional(),
  categoryId: z.string().max(60).optional(),
});
export type UpdateProductDto = z.infer<typeof updateProductSchema>;

export const updateVariantSchema = z.object({
  sku: z.string().max(80).optional(),
  size: z.string().max(40).optional(),
  color: z.string().max(60).nullable().optional(),
  price: price.optional(),
});
export type UpdateVariantDto = z.infer<typeof updateVariantSchema>;

export const priceSchema = z.object({ price: z.union([z.string().max(20), z.number()]) });
export type PriceDto = z.infer<typeof priceSchema>;

export const activeSchema = z.object({ active: z.boolean() });
export type ActiveDto = z.infer<typeof activeSchema>;

export const searchProductsSchema = z.object({
  page: z.coerce.number().int().default(1),
  pageSize: z.coerce.number().int().default(20),
  text: z.string().max(100).optional(),
  categoryId: z.string().max(60).optional(),
  stock: z.enum(['out', 'in', 'partial']).optional(),
  active: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
});
export type SearchProductsDto = z.infer<typeof searchProductsSchema>;

// DTOs de respuesta HTTP.
export interface VariantResponseDto {
  id: string;
  sku: string;
  size: string;
  color: string | null;
  price: string;
  active: boolean;
  available?: number;
  location?: string | null;
  reorderLevel?: number;
}

export interface ProductResponseDto {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
  variants: VariantResponseDto[];
  available?: number;
  soldOutVariants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPageResponseDto {
  items: ProductResponseDto[];
  total: number;
  page: number;
  pageSize: number;
}

// Mappers aplicación -> HTTP.
const toVariantResponse = (variant: VariantResult): VariantResponseDto => ({ ...variant });

export const toProductResponse = (product: ProductResult): ProductResponseDto => ({
  id: product.id,
  categoryId: product.categoryId,
  name: product.name,
  slug: product.slug,
  description: product.description,
  active: product.active,
  variants: product.variants.map(toVariantResponse),
  available: product.available,
  soldOutVariants: product.soldOutVariants,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const toProductPageResponse = (page: ProductPageResult): ProductPageResponseDto => ({
  items: page.items.map(toProductResponse),
  total: page.total,
  page: page.page,
  pageSize: page.pageSize,
});
