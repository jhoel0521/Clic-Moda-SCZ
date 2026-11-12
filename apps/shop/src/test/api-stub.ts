import { vi } from 'vitest';
import {
  catalog,
  type CardProduct,
  type CatalogPage,
  type Filters,
  type Product,
} from '../lib/catalog';
import { FALLBACK_SETTINGS, settingsStore, type StoreSettings } from '../lib/settings';
import { forgetMaps } from '../lib/maps';

// Respuestas simuladas de la API por ruta. `null` en una ruta = 404; un Error = la API no responde.
export interface ApiWorld {
  settings?: StoreSettings;
  list?: CatalogPage | Error;
  filters?: Filters;
  product?: Product | null | Error;
  slugs?: { slug: string; updatedAt: string }[];
}

export const EMPTY_FILTERS: Filters = { categories: [], sizes: [] };

export function stubApi(world: ApiWorld): void {
  settingsStore.reset();
  catalog.reset();
  forgetMaps();
  vi.stubGlobal(
    'fetch',
    vi.fn((input: string | URL) => {
      const { pathname } = new URL(String(input));
      return Promise.resolve(answer(pathname, world));
    })
  );
}

function answer(pathname: string, world: ApiWorld): Response {
  if (pathname === '/store-settings') return Response.json(world.settings ?? FALLBACK_SETTINGS);
  if (pathname === '/public/catalog') return reply(world.list);
  if (pathname === '/public/catalog/filters') return reply(world.filters ?? EMPTY_FILTERS);
  if (pathname === '/public/catalog/slugs') return reply(world.slugs ?? []);
  if (pathname.startsWith('/public/catalog/products/')) return reply(world.product);
  return new Response(null, { status: 404 });
}

function reply(value: unknown): Response {
  if (value instanceof Error) throw value;
  if (value === null || value === undefined) return new Response(null, { status: 404 });
  return Response.json(value);
}

export const card = (over: Partial<CardProduct> = {}): CardProduct => ({
  slug: 'bota-andes',
  name: 'Bota Andes',
  category: { name: 'Botas', slug: 'botas' },
  price: '349.90',
  priceVaries: false,
  availability: 'in_stock',
  photo: {
    alt: 'Frente',
    card: '/m/a/card-1.webp',
    thumb: '/m/a/thumb-1.webp',
    link: '/m/a/link-1.jpg',
  },
  updatedAt: '2026-11-02T00:00:00.000Z',
  ...over,
});

export const detail = (over: Partial<Product> = {}): Product => ({
  slug: 'bota-andes',
  name: 'Bota Andes',
  category: { name: 'Botas', slug: 'botas' },
  price: '349.90',
  priceVaries: false,
  availability: 'in_stock',
  updatedAt: '2026-11-02T00:00:00.000Z',
  description: 'Cuero genuino, suela de goma.',
  photos: [
    {
      alt: 'Frente',
      card: '/m/a/card-1.webp',
      thumb: '/m/a/thumb-1.webp',
      link: '/m/a/link-1.jpg',
    },
    { alt: 'Lado', card: '/m/b/card-1.webp', thumb: '/m/b/thumb-1.webp', link: '/m/b/link-1.jpg' },
  ],
  variants: [
    { size: '38', color: 'Negro', sku: 'BOT-38-NEG', price: '349.90', availability: 'in_stock' },
    { size: '39', color: 'Negro', sku: 'BOT-39-NEG', price: '349.90', availability: 'low' },
    { size: '40', color: 'Negro', sku: 'BOT-40-NEG', price: '349.90', availability: 'out' },
  ],
  ...over,
});

export const page = (items: CardProduct[], over: Partial<CatalogPage> = {}): CatalogPage => ({
  items,
  total: items.length,
  page: 1,
  pageSize: 12,
  ...over,
});

export const withWhatsapp = (number = '59171234567'): StoreSettings => ({
  ...FALLBACK_SETTINGS,
  contact: { ...FALLBACK_SETTINGS.contact, whatsapp: number },
});
