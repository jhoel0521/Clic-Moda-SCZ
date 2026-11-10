import type { Product } from './entities/product.entity.js';
import type { CategoryId, ProductId, VariantId } from './value-objects/ids.vo.js';
import type { Sku } from './value-objects/variant-attributes.vo.js';

export interface ProductSearchFilter {
  // Texto contenido en el nombre del producto o en el SKU de alguna variante, sin distinguir mayúsculas.
  text?: string;
  categoryId?: CategoryId;
  active?: boolean;
  page: number; // desde 1
  pageSize: number;
}

export interface ProductPage {
  items: Product[]; // ordenados por nombre
  total: number; // total que cumple el filtro, sin paginar
}

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
export interface ProductsRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByVariantId(id: VariantId): Promise<Product | null>;
  skuExists(sku: Sku): Promise<boolean>;
  search(filter: ProductSearchFilter): Promise<ProductPage>;
  countByCategory(categoryId: CategoryId): Promise<number>;
  // Crea o actualiza el producto con todas sus variantes de forma atómica (todo o nada).
  // Lanza ConflictError si algún SKU ya pertenece a una variante de otro producto.
  save(product: Product): Promise<void>;
}

export const PRODUCTS_REPOSITORY = Symbol('ProductsRepository');
