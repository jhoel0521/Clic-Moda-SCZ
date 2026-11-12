import type { Money } from './value-objects/money.vo.js';

// Lectura del catálogo para el público. Devuelve SOLO lo vendible (producto, categoría y variante activos) y
// no contiene datos internos (costos, ubicaciones, niveles de reposición): `available` es el disponible de la
// variante y solo se usa dentro de la aplicación para decidir el estado; nunca sale tal cual.
export interface PublishedVariant {
  readonly sku: string;
  readonly size: string;
  readonly color: string | null;
  readonly price: Money;
  readonly available: number;
}

export interface PublishedProduct {
  readonly slug: string;
  readonly name: string;
  readonly description: string | null;
  readonly categoryName: string;
  readonly categorySlug: string;
  // El menor precio entre sus variantes activas ("desde"); cada variante lleva el suyo.
  readonly price: Money;
  // Identificadores de imagen en orden (la primera es la principal); pueden incluir imágenes ya borradas.
  readonly photoIds: readonly string[];
  readonly variants: readonly PublishedVariant[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export type PublicSort = 'new' | 'price_asc' | 'price_desc';

export interface PublicListFilter {
  categorySlug?: string;
  size?: string;
  text?: string;
  onlyAvailable: boolean;
  sort: PublicSort;
  page: number; // desde 1
  pageSize: number; // hasta 48
}

export interface PublicFilters {
  categories: { name: string; slug: string; count: number }[];
  sizes: string[];
}

export interface PublishedSlug {
  readonly slug: string;
  readonly updatedAt: Date;
}

export interface PublicCatalogReader {
  list(filter: PublicListFilter): Promise<{ items: PublishedProduct[]; total: number }>;
  findBySlug(slug: string): Promise<PublishedProduct | null>;
  filters(): Promise<PublicFilters>;
  slugs(): Promise<PublishedSlug[]>;
}

export const PUBLIC_CATALOG_READER = Symbol('PublicCatalogReader');
