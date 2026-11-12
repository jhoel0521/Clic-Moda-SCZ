import type { Availability } from '../../domain/availability.js';
import type { PublicSort } from '../../domain/public-catalog.reader.port.js';

export const MAX_PUBLIC_PAGE_SIZE = 48;
export const DEFAULT_PUBLIC_PAGE_SIZE = 12;

export class ListPublicCatalogQuery {
  constructor(
    readonly page: number,
    readonly pageSize: number,
    readonly sort: PublicSort,
    readonly onlyAvailable: boolean,
    readonly categorySlug?: string,
    readonly size?: string,
    readonly text?: string
  ) {}
}

export class GetPublicProductQuery {
  constructor(readonly slug: string) {}
}

// Rutas bajo el dominio de la tienda (/m/<id>/<formato>-<revisión>.<ext>); el navegador nunca ve la API.
export interface PublicPhotoResult {
  readonly alt: string;
  readonly card: string;
  readonly thumb: string;
  readonly link: string;
}

export interface PublicVariantResult {
  readonly size: string;
  readonly color: string | null;
  readonly sku: string;
  readonly price: string;
  readonly availability: Availability;
}

export interface PublicCategoryResult {
  readonly name: string;
  readonly slug: string;
}

// Tarjeta del listado: lo mínimo para pintarla.
export interface PublicProductCardResult {
  readonly slug: string;
  readonly name: string;
  readonly category: PublicCategoryResult;
  // El menor precio de sus variantes; si `priceVaries`, la tienda lo muestra como "Desde".
  readonly price: string;
  readonly priceVaries: boolean;
  readonly availability: Availability;
  // Variantes para pintar color, tallas y su precio en la tarjeta.
  readonly variants: readonly PublicVariantResult[];
  readonly photo: PublicPhotoResult | null;
  readonly updatedAt: string;
}

export interface PublicProductResult extends Omit<PublicProductCardResult, 'photo' | 'variants'> {
  readonly description: string | null;
  readonly photos: readonly PublicPhotoResult[];
  readonly variants: readonly PublicVariantResult[];
}

export interface PublicCatalogPageResult {
  readonly items: readonly PublicProductCardResult[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}

export interface PublicFiltersResult {
  readonly categories: readonly { name: string; slug: string; count: number }[];
  readonly sizes: readonly string[];
}

export interface PublishedSlugResult {
  readonly slug: string;
  readonly updatedAt: string;
}
