import type { IImage } from '@src/core/models/IUser';

export type { IImage };

/** Medidas dinámicas de una prenda (JSON flexible) */
export type MedidasDinamicas = Record<string, string | number>;

/** Talla disponible */
export type Talla = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | string;

/** Categoría de producto */
export type CategoriaProducto =
  | 'vestidos'
  | 'blusas'
  | 'pantalones'
  | 'faldas'
  | 'chaquetas'
  | 'accesorios'
  | 'conjuntos'
  | string;

/** Estado del producto — PRODUCTO.estado */
export type EstadoProducto = 'activo' | 'inactivo';

/** Producto del catálogo */
export interface IProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // precio antes del descuento
  /** PRODUCTO.estado — controla visibilidad en el catálogo */
  estado: EstadoProducto;
  /** PRODUCTO.tipo_tela — material de la prenda */
  tipo_tela?: string;
  category: CategoriaProducto;
  images: IImage[];
  sizes: Talla[];
  colors: string[];
  /** Stock disponible por talla: { S: 5, M: 3, L: 2, XL: 1 } */
  stock: Record<Talla, number>;
  /** Medidas de la prenda por talla: { S: "...", M: "..." } o { largo: "75cm", ... } */
  medidas_dinamicas: MedidasDinamicas;
  etiquetaIds: string[];
  tagNames: string[];
  isFlashSale?: boolean;
  flashSaleEndsAt?: string; // ISO date string
  rating?: number;
  reviewCount?: number;
  createdAt: string;
}

/** Filtros de búsqueda del catálogo */
export interface IProductFilters {
  search?: string;
  category?: CategoriaProducto;
  minPrice?: number;
  maxPrice?: number;
  sizes?: Talla[];
  colors?: string[];
  etiquetaIds?: string[];
  onlyFlashSale?: boolean;
}
