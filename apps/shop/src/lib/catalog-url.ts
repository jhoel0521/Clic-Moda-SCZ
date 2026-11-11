import type { Filters, ListParams } from './catalog';

// Filtros del catálogo en la URL de la tienda (en español, para que el enlace se entienda y se comparta):
// ?categoria=botas&talla=38&q=andes&disponibles=1&orden=precio-asc&pagina=2
export interface CatalogState {
  category: string | null;
  size: string | null;
  q: string | null;
  available: boolean;
  sort: 'new' | 'price_asc' | 'price_desc';
  page: number;
}

const SORT_FROM_URL = { 'precio-asc': 'price_asc', 'precio-desc': 'price_desc' } as const;
const SORT_TO_URL = { price_asc: 'precio-asc', price_desc: 'precio-desc' } as const;

export const SORT_LABELS = {
  new: 'Novedades',
  price_asc: 'Precio: menor a mayor',
  price_desc: 'Precio: mayor a menor',
} as const;

const clean = (value: string | null, max: number): string | null => {
  const text = value?.trim().slice(0, max) ?? '';
  return text || null;
};

export function parseCatalogState(search: URLSearchParams): CatalogState {
  const page = Number.parseInt(search.get('pagina') ?? '1', 10);
  const sort = SORT_FROM_URL[(search.get('orden') ?? '') as keyof typeof SORT_FROM_URL];
  return {
    category: clean(search.get('categoria'), 80),
    size: clean(search.get('talla'), 20),
    q: clean(search.get('q'), 100),
    available: search.get('disponibles') === '1',
    sort: sort ?? 'new',
    page: Number.isFinite(page) && page > 1 ? page : 1,
  };
}

// Lo que se le pide a la API.
export const toListParams = (state: CatalogState): ListParams => ({
  page: state.page,
  category: state.category ?? undefined,
  size: state.size ?? undefined,
  q: state.q ?? undefined,
  available: state.available,
  sort: state.sort,
});

// URL de la tienda para un estado (orden fijo; lo que es por omisión no se escribe).
export function catalogHref(state: CatalogState): string {
  const search = new URLSearchParams();
  if (state.category) search.set('categoria', state.category);
  if (state.size) search.set('talla', state.size);
  if (state.q) search.set('q', state.q);
  if (state.available) search.set('disponibles', '1');
  if (state.sort !== 'new') search.set('orden', SORT_TO_URL[state.sort]);
  if (state.page > 1) search.set('pagina', String(state.page));
  const text = search.toString();
  return text ? `/catalogo?${text}` : '/catalogo';
}

// Cambiar un filtro vuelve a la página 1 (los resultados cambian); cambiar solo la página no toca los filtros.
export const withFilter = (state: CatalogState, change: Partial<CatalogState>): CatalogState => ({
  ...state,
  ...change,
  page: 'page' in change ? (change.page as number) : 1,
});

export interface Chip {
  label: string;
  /** Enlace que quita ese filtro. */
  href: string;
}

// Los filtros activos como chips que se quitan con un toque.
export function activeChips(state: CatalogState, filters: Filters): Chip[] {
  const chips: Chip[] = [];
  const category = filters.categories.find((item) => item.slug === state.category);
  if (state.category) {
    chips.push({
      label: category?.name ?? state.category,
      href: catalogHref(withFilter(state, { category: null })),
    });
  }
  if (state.size)
    chips.push({
      label: `Talla ${state.size}`,
      href: catalogHref(withFilter(state, { size: null })),
    });
  if (state.q)
    chips.push({ label: `“${state.q}”`, href: catalogHref(withFilter(state, { q: null })) });
  if (state.available)
    chips.push({
      label: 'Solo disponibles',
      href: catalogHref(withFilter(state, { available: false })),
    });
  return chips;
}

export const totalPages = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));
