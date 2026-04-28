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

/** Producto del catálogo */
export interface IProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number; // precio antes del descuento
  category: CategoriaProducto;
  images: IImage[];
  sizes: Talla[];
  colors: string[];
  stock: number;
  /** Medidas de la prenda por talla: { S: "...", M: "..." } o { largo: "75cm", ... } */
  medidas_dinamicas: MedidasDinamicas;
  tags: string[];
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
  tags?: string[];
  onlyFlashSale?: boolean;
}
