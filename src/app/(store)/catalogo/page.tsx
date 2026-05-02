'use client';

import { useEffect, useState, useTransition } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { ProductService } from '@src/services/ProductService';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { useDebounce } from '@src/shared/hooks/useDebounce';
import type { IProduct, IProductFilters, Talla } from '@src/core/models';

const CATEGORIAS = [
  'vestidos',
  'blusas',
  'pantalones',
  'conjuntos',
  'chaquetas',
  'faldas',
  'accesorios',
];
const TALLAS: Talla[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

interface Filters {
  search: string;
  category: string;
  sizes: Talla[];
  minPrice: string;
  maxPrice: string;
}

const EMPTY: Filters = { search: '', category: '', sizes: [], minPrice: '', maxPrice: '' };

function hasActive(f: Filters) {
  return !!(f.search || f.category || f.sizes.length > 0 || f.minPrice || f.maxPrice);
}

function FilterPanel({
  filters,
  onReset,
  onToggleCategory,
  onToggleSize,
  onPrice,
}: {
  filters: Filters;
  onReset: () => void;
  onToggleCategory: (c: string) => void;
  onToggleSize: (s: Talla) => void;
  onPrice: (field: 'minPrice' | 'maxPrice', v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <p className="font-bold text-gray-900">Filtros</p>
        {hasActive(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-pink-600 hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categoría */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Categoría
        </p>
        <div className="space-y-2">
          {CATEGORIAS.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-600 capitalize hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={() => onToggleCategory(cat)}
                className="h-4 w-4 rounded border-gray-300 accent-pink-600"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6 h-px bg-gray-100" />

      {/* Tallas */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">Talla</p>
        <div className="flex flex-wrap gap-2">
          {TALLAS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onToggleSize(size)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                filters.sizes.includes(size)
                  ? 'border-gray-900 bg-gray-900 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 h-px bg-gray-100" />

      {/* Precio */}
      <div>
        <p className="mb-3 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          Precio (Bs.)
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filters.minPrice}
            onChange={(e) => onPrice('minPrice', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
          <input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice}
            onChange={(e) => onPrice('maxPrice', e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-pink-500"
          />
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isPending, startTransition] = useTransition();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 350);

  useEffect(() => {
    const f: IProductFilters = {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.category && { category: filters.category }),
      ...(filters.sizes.length > 0 && { sizes: filters.sizes }),
      ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
      ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
    };
    startTransition(async () => {
      const all = await ProductService.getProducts(f);
      setProducts(all.filter((p) => p.estado === 'activo'));
    });
  }, [debouncedSearch, filters.category, filters.sizes, filters.minPrice, filters.maxPrice]);

  const filterProps = {
    filters,
    onReset: () => setFilters(EMPTY),
    onToggleCategory: (cat: string) =>
      setFilters((p) => ({ ...p, category: p.category === cat ? '' : cat })),
    onToggleSize: (size: Talla) =>
      setFilters((p) => ({
        ...p,
        sizes: p.sizes.includes(size) ? p.sizes.filter((s) => s !== size) : [...p.sizes, size],
      })),
    onPrice: (field: 'minPrice' | 'maxPrice', v: string) =>
      setFilters((p) => ({ ...p, [field]: v })),
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900 md:text-3xl">Catálogo Completo</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isPending ? 'Buscando...' : `${products.length} productos disponibles`}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64 md:flex-none">
              <Search
                size={15}
                className="absolute top-1/2 left-3.5 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pr-3 pl-9 text-sm shadow-sm outline-none focus:border-pink-500"
              />
            </div>

            {/* Filters button (mobile) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 lg:hidden"
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasActive(filters) && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-pink-600 text-[9px] font-bold text-white">
                  !
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile filter drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute right-0 bottom-0 left-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-bold text-gray-900">Filtros</p>
                <button type="button" onClick={() => setDrawerOpen(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <FilterPanel {...filterProps} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="mt-4 w-full rounded-xl bg-gray-900 py-3 font-bold text-white"
              >
                Ver {products.length} resultados
              </button>
            </div>
          </div>
        )}

        {/* Main grid + sidebar */}
        <div className="flex items-start gap-8">
          {/* Sidebar desktop */}
          <aside className="sticky top-20 hidden w-64 shrink-0 lg:block">
            <FilterPanel {...filterProps} />
          </aside>

          {/* Product grid */}
          <div className="min-w-0 flex-1">
            {isPending ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white"
                  >
                    <div className="aspect-[3/4] bg-gray-200" />
                    <div className="space-y-2 p-4">
                      <div className="h-3 w-1/2 rounded-full bg-gray-200" />
                      <div className="h-3.5 w-3/4 rounded-full bg-gray-200" />
                      <div className="mt-2 h-4 w-1/3 rounded-full bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-20 text-center">
                <p className="mb-4 text-4xl">🔍</p>
                <p className="mb-2 font-bold text-gray-900">Sin resultados</p>
                <p className="mb-5 text-sm text-gray-500">
                  No encontramos productos con esos filtros.
                </p>
                {hasActive(filters) && (
                  <button
                    type="button"
                    onClick={() => setFilters(EMPTY)}
                    className="text-sm font-bold text-pink-600 hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
                {products.map((product, i) => (
                  <ProductCard key={product.id} product={product} priority={i === 0} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
