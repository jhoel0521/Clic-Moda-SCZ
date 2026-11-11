import type { Product } from './entities/product.entity.js';
import type { CategoryId, ProductId, VariantId } from './value-objects/ids.vo.js';
import type { Slug } from './value-objects/names.vo.js';
import type { Sku } from './value-objects/variant-attributes.vo.js';

export interface ProductSearchFilter {
  // Texto contenido en el nombre del producto o en el SKU de alguna variante, sin distinguir mayúsculas.
  text?: string;
  categoryId?: CategoryId;
  active?: boolean;
  // Disponible total (físico menos reservado, solo variantes activas): 'out' = 0 o menos, 'in' = más de 0.
  // 'partial' = al menos una variante activa agotada (aunque el producto tenga stock en otras).
  stock?: 'out' | 'in' | 'partial';
  page: number; // desde 1
  pageSize: number;
}

// Stock de una variante tal como lo necesita la matriz de inventario (lectura del inventario).
export interface VariantStock {
  readonly available: number;
  readonly location: string | null;
  readonly reorderLevel: number;
}

export interface ProductPage {
  items: Product[]; // ordenados por nombre
  total: number; // total que cumple el filtro, sin paginar
  // Unidades disponibles de cada producto de la página (clave: id del producto).
  available: Readonly<Record<string, number>>;
  // Cuántas variantes activas de cada producto están agotadas (disponible 0 o menos).
  soldOutVariants: Readonly<Record<string, number>>;
  // Stock de cada variante de la página (clave: id de la variante).
  variantStock: Readonly<Record<string, VariantStock>>;
}

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
export interface ProductsRepository {
  findById(id: ProductId): Promise<Product | null>;
  findByVariantId(id: VariantId): Promise<Product | null>;
  skuExists(sku: Sku): Promise<boolean>;
  findBySlug(slug: Slug): Promise<Product | null>;
  slugExists(slug: Slug): Promise<boolean>;
  search(filter: ProductSearchFilter): Promise<ProductPage>;
  countByCategory(categoryId: CategoryId): Promise<number>;
  // Crea o actualiza el producto con todas sus variantes de forma atómica (todo o nada).
  // Lanza ConflictError si algún SKU ya pertenece a una variante de otro producto.
  save(product: Product): Promise<void>;
}

export const PRODUCTS_REPOSITORY = Symbol('ProductsRepository');
