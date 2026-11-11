import { apiBase } from './api-server';

// Formas de las respuestas de GET /public/catalog (la API ya entrega solo lo vendible y sin datos internos).
export type Availability = 'in_stock' | 'low' | 'out';

export interface Photo {
  alt: string;
  card: string;
  thumb: string;
  link: string;
}

export interface CardProduct {
  slug: string;
  name: string;
  category: { name: string; slug: string };
  price: string; // "349.90"
  availability: Availability;
  photo: Photo | null;
  updatedAt: string;
}

export interface VariantOption {
  size: string;
  color: string | null;
  sku: string;
  availability: Availability;
}

export interface Product extends Omit<CardProduct, 'photo'> {
  description: string | null;
  photos: Photo[];
  variants: VariantOption[];
}

export interface CatalogPage {
  items: CardProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Filters {
  categories: { name: string; slug: string; count: number }[];
  sizes: string[];
}

export interface SlugEntry {
  slug: string;
  updatedAt: string;
}

export interface ListParams {
  page?: number;
  category?: string;
  size?: string;
  q?: string;
  available?: boolean;
  sort?: 'new' | 'price_asc' | 'price_desc';
}

// Peor caso entre un cambio de stock y lo que ve el visitante: 15 s de la API + 15 s de aquí = 30 s (< 60 s).
export const CATALOG_TTL_MS = 15_000;
export const RETRY_AFTER_MS = 5_000;
const MAX_ENTRIES = 200;
const REQUEST_TIMEOUT_MS = 3_000;

// La API del catálogo no responde y no hay ningún valor anterior que mostrar.
export class CatalogUnavailableError extends Error {
  constructor() {
    super('El catálogo no está disponible por ahora');
    this.name = 'CatalogUnavailableError';
  }
}

// Parámetros de la API en orden fijo (misma URL = misma entrada de caché).
export function listQuery(params: ListParams): string {
  const search = new URLSearchParams();
  const entries: [string, string | undefined][] = [
    ['page', params.page && params.page > 1 ? String(params.page) : undefined],
    ['category', params.category],
    ['size', params.size],
    ['q', params.q],
    ['available', params.available ? 'true' : undefined],
    ['sort', params.sort && params.sort !== 'new' ? params.sort : undefined],
  ];
  for (const [key, value] of entries) if (value) search.set(key, value);
  const text = search.toString();
  return text ? `?${text}` : '';
}

type Fetcher = (url: string, init: RequestInit) => Promise<Response>;

interface Deps {
  fetcher: Fetcher;
  now: () => number;
  base: () => string;
}

interface Entry {
  data: unknown;
  at: number;
}

// Memoria acotada: las URLs distintas no hacen crecer la caché sin límite (se descarta la más antigua).
function boundedCache() {
  const cache = new Map<string, Entry>();
  return {
    get: (url: string) => cache.get(url),
    set(url: string, entry: Entry): void {
      cache.delete(url);
      cache.set(url, entry);
      if (cache.size > MAX_ENTRIES) cache.delete(cache.keys().next().value as string);
    },
    clear: () => cache.clear(),
  };
}

// Pide una URL: devuelve null si no existe (404) y lanza ante cualquier otro fallo.
async function request<T>(fetcher: Fetcher, url: string): Promise<T | null> {
  const response = await fetcher(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${String(response.status)}`);
  return (await response.json()) as T;
}

// Cliente con caché en memoria por URL. Ante un fallo entrega el último valor válido; si nunca hubo uno,
// lanza CatalogUnavailableError. Un 404 no es un fallo: es "no existe" (null) y no se guarda.
export function createCatalogClient({ fetcher, now, base }: Deps) {
  const cache = boundedCache();

  async function load<T>(path: string): Promise<T | null> {
    const url = `${base()}/public/catalog${path}`;
    const hit = cache.get(url);
    const t = now();
    if (hit && t - hit.at < CATALOG_TTL_MS) return hit.data as T;
    try {
      const data = await request<T>(fetcher, url);
      if (data !== null) cache.set(url, { data, at: t });
      return data;
    } catch {
      if (!hit) throw new CatalogUnavailableError();
      cache.set(url, { data: hit.data, at: t - CATALOG_TTL_MS + RETRY_AFTER_MS });
      return hit.data as T;
    }
  }

  return {
    list: (params: ListParams) => load<CatalogPage>(listQuery(params)) as Promise<CatalogPage>,
    product: (slug: string) => load<Product>(`/products/${encodeURIComponent(slug)}`),
    filters: () => load<Filters>('/filters') as Promise<Filters>,
    slugs: () => load<SlugEntry[]>('/slugs') as Promise<SlugEntry[]>,
    reset: () => cache.clear(),
  };
}

// `fetch` se busca en cada llamada (no se guarda su referencia): así las pruebas pueden sustituirlo.
export const catalog = createCatalogClient({
  fetcher: (url, init) => fetch(url, init),
  now: Date.now,
  base: apiBase,
});
