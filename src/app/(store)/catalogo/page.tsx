'use client';

import { useEffect, useState, useTransition } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { ProductService } from '@src/services/ProductService';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { useDebounce } from '@src/shared/hooks/useDebounce';
import type { IProduct, IProductFilters, Talla } from '@src/core/models';

const CATEGORIAS = ['vestidos', 'blusas', 'pantalones', 'conjuntos', 'chaquetas', 'faldas', 'accesorios'];
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <p className="font-bold text-gray-900">Filtros</p>
        {hasActive(filters) && (
          <button type="button" onClick={onReset} className="text-xs text-pink-600 font-medium hover:underline">
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categoría */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Categoría</p>
        <div className="space-y-2">
          {CATEGORIAS.map((cat) => (
            <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-sm capitalize text-gray-600 hover:text-gray-900">
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

      <div className="h-px bg-gray-100 mb-6" />

      {/* Tallas */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Talla</p>
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

      <div className="h-px bg-gray-100 mb-6" />

      {/* Precio */}
      <div>
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gray-400">Precio (Bs.)</p>
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
    <div className="bg-gray-50 pb-20 md:pb-0 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 mb-6 gap-4">
          <div>
            <h1 className="font-black text-2xl md:text-3xl text-gray-900">Catálogo Completo</h1>
            <p className="text-gray-500 text-sm mt-1">
              {isPending ? 'Buscando...' : `${products.length} productos disponibles`}
            </p>
          </div>

          <div className="flex gap-3">
            {/* Search */}
            <div className="relative flex-1 md:w-64 md:flex-none">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Buscar..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-pink-500 shadow-sm"
              />
            </div>

            {/* Filters button (mobile) */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 h-10 bg-white border border-gray-200 px-4 rounded-lg text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hasActive(filters) && (
                <span className="w-4 h-4 rounded-full bg-pink-600 text-white text-[9px] font-bold flex items-center justify-center">!</span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile filter drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-gray-900">Filtros</p>
                <button type="button" onClick={() => setDrawerOpen(false)}>
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <FilterPanel {...filterProps} />
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="mt-4 w-full bg-gray-900 text-white font-bold py-3 rounded-xl"
              >
                Ver {products.length} resultados
              </button>
            </div>
          </div>
        )}

        {/* Main grid + sidebar */}
        <div className="flex gap-8 items-start">
          {/* Sidebar desktop */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-20">
            <FilterPanel {...filterProps} />
          </aside>

          {/* Product grid */}
          <div className="flex-1 min-w-0">
            {isPending ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                    <div className="aspect-[3/4] bg-gray-200" />
                    <div className="p-4 space-y-2">
                      <div className="h-3 bg-gray-200 rounded-full w-1/2" />
                      <div className="h-3.5 bg-gray-200 rounded-full w-3/4" />
                      <div className="h-4 bg-gray-200 rounded-full w-1/3 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-4xl mb-4">🔍</p>
                <p className="font-bold text-gray-900 mb-2">Sin resultados</p>
                <p className="text-sm text-gray-500 mb-5">No encontramos productos con esos filtros.</p>
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
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
