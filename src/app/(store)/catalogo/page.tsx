'use client';

import { useEffect, useState, useTransition } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductService } from '@src/services/ProductService';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { Spinner } from '@src/shared/ui/Spinner';
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

const EMPTY_FILTERS: Filters = { search: '', category: '', sizes: [], minPrice: '', maxPrice: '' };

function hasActiveFilters(f: Filters) {
  return f.search || f.category || f.sizes.length > 0 || f.minPrice || f.maxPrice;
}

interface FilterPanelProps {
  filters: Filters;
  onReset: () => void;
  onToggleCategory: (cat: string) => void;
  onToggleSize: (size: Talla) => void;
  onPriceChange: (field: 'minPrice' | 'maxPrice', value: string) => void;
}

function FilterPanel({ filters, onReset, onToggleCategory, onToggleSize, onPriceChange }: FilterPanelProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-semibold text-[var(--color-text-primary)]">Filtros</p>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-[var(--color-brand)] font-medium hover:underline"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categoría */}
      <div className="mb-6">
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Categoría
        </p>
        <div className="space-y-2">
          {CATEGORIAS.map((cat) => (
            <label
              key={cat}
              className="flex cursor-pointer items-center gap-2.5 text-sm capitalize text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={() => onToggleCategory(cat)}
                className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-brand)]"
              />
              {cat}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-6 h-px bg-[var(--color-border)]" />

      {/* Tallas */}
      <div className="mb-6">
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Talla
        </p>
        <div className="flex flex-wrap gap-2">
          {TALLAS.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => onToggleSize(size)}
              className={[
                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-all duration-150',
                filters.sizes.includes(size)
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand)]'
                  : 'border-[var(--color-border)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)]',
              ].join(' ')}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 h-px bg-[var(--color-border)]" />

      {/* Precio */}
      <div>
        <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
          Precio (Bs.)
        </p>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filters.minPrice}
            onChange={(e) => onPriceChange('minPrice', e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
          <input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice}
            onChange={(e) => onPriceChange('maxPrice', e.target.value)}
            className="w-full rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isPending, startTransition] = useTransition();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 350);

  useEffect(() => {
    const serviceFilters: IProductFilters = {
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(filters.category && { category: filters.category }),
      ...(filters.sizes.length > 0 && { sizes: filters.sizes }),
      ...(filters.minPrice && { minPrice: Number(filters.minPrice) }),
      ...(filters.maxPrice && { maxPrice: Number(filters.maxPrice) }),
    };
    startTransition(async () => {
      const all = await ProductService.getProducts(serviceFilters);
      setProducts(all.filter((p) => p.estado === 'activo'));
    });
  }, [debouncedSearch, filters.category, filters.sizes, filters.minPrice, filters.maxPrice]);

  function toggleSize(size: Talla) {
    setFilters((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size) ? prev.sizes.filter((s) => s !== size) : [...prev.sizes, size],
    }));
  }

  function toggleCategory(cat: string) {
    setFilters((prev) => ({ ...prev, category: prev.category === cat ? '' : cat }));
  }

  function resetFilters() {
    setFilters(EMPTY_FILTERS);
  }

  function handlePriceChange(field: 'minPrice' | 'maxPrice', value: string) {
    setFilters((f) => ({ ...f, [field]: value }));
  }

  const filterPanelProps: FilterPanelProps = {
    filters,
    onReset: resetFilters,
    onToggleCategory: toggleCategory,
    onToggleSize: toggleSize,
    onPriceChange: handlePriceChange,
  };

  return (
    <>
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 inline-flex rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
          Catálogo
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
          Encontrá prendas que sí te quedan
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
          {isPending ? 'Cargando...' : `${products.length} productos disponibles`}
          , con fotos claras, tallas exactas y navegación simple.
        </p>
      </header>

      {/* Buscador + filtro mobile */}
      <div className="mb-8 flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="search"
            placeholder="Buscar prenda, tela, etiqueta..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="h-11 w-full rounded-xl border border-[var(--color-border)] bg-white pl-10 pr-4 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] shadow-[var(--shadow-sm)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
          />
        </div>
        <button
          type="button"
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden inline-flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-4 text-sm font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)]"
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters(filters) && (
            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-brand)] text-[9px] font-bold text-white">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile filters drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-[var(--color-text-primary)]">Filtros</p>
              <button type="button" onClick={() => setShowMobileFilters(false)}>
                <X size={20} className="text-[var(--color-text-muted)]" />
              </button>
            </div>
            <FilterPanel {...filterPanelProps} />
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <FilterPanel {...filterPanelProps} />
          </div>
        </aside>

        <section className="min-w-0">
          {isPending ? (
            <div className="flex justify-center py-24">
              <Spinner size="lg" />
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center shadow-[var(--shadow-sm)]">
              <p className="text-[var(--color-text-muted)] mb-3">No se encontraron productos.</p>
              {hasActiveFilters(filters) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-sm font-medium text-[var(--color-brand)] hover:underline"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index === 0} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
