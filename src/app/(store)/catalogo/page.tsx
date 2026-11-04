'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductService } from '@src/services/ProductService';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { CATEGORIAS, TALLAS_CALZADO, TALLAS_ROPA } from '@src/core/constants/CATALOG';
import type { IProduct } from '@src/core/models';

type Orden = 'relevancia' | 'menor' | 'mayor';

function CatalogContent() {
  const params = useSearchParams();
  const searchRef = useRef<HTMLInputElement>(null);

  const [all, setAll] = useState<IProduct[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('categoria') ?? '');
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState('');
  const [orden, setOrden] = useState<Orden>('relevancia');
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    void ProductService.getProducts().then((products) => {
      setAll(products.filter((p) => p.estado === 'activo'));
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (params.get('buscar')) searchRef.current?.focus();
  }, [params]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = all.filter((p) => {
      if (category && p.category !== category) return false;
      if (q && !`${p.name} ${p.description} ${p.tagNames.join(' ')}`.toLowerCase().includes(q)) {
        return false;
      }
      if (sizes.length > 0 && !sizes.some((s) => (p.stock[s] ?? 0) > 0)) return false;
      if (maxPrice && p.price > Number(maxPrice)) return false;
      return true;
    });
    if (orden === 'menor') return [...list].sort((a, b) => a.price - b.price);
    if (orden === 'mayor') return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [all, category, search, sizes, maxPrice, orden]);

  const activeFilters = sizes.length + (maxPrice ? 1 : 0) + (orden !== 'relevancia' ? 1 : 0);

  function toggleSize(size: string) {
    setSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  function clearFilters() {
    setSizes([]);
    setMaxPrice('');
    setOrden('relevancia');
  }

  const chip = (selected: boolean) =>
    `flex h-10 items-center rounded-full border px-4 text-sm font-semibold whitespace-nowrap ${
      selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
    }`;

  return (
    <div className="mx-auto max-w-[1200px] pt-3 md:px-6 md:pt-8">
      {/* Búsqueda y categorías */}
      <div className="sticky top-14 z-30 space-y-2 bg-gray-50 pb-2 lg:top-16">
        <div className="flex gap-2 px-4 md:px-0">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchRef}
              type="search"
              enterKeyHint="search"
              placeholder="Buscar zapatos, botas..."
              aria-label="Buscar productos"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border border-gray-200 bg-white pr-3 pl-10 outline-none focus:border-pink-600"
            />
          </div>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-label="Abrir filtros"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-800"
          >
            <SlidersHorizontal size={18} />
            {activeFilters > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[11px] font-bold text-white">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
        <div className="snap-row gap-2 px-4 md:px-0">
          <button type="button" onClick={() => setCategory('')} className={chip(!category)}>
            Todo
          </button>
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(category === cat.id ? '' : cat.id)}
              className={chip(category === cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <p className="px-4 py-2 text-sm text-gray-500 md:px-0" aria-live="polite">
        {loaded ? `${results.length} ${results.length === 1 ? 'producto' : 'productos'}` : ' '}
      </p>

      {loaded && results.length === 0 ? (
        <div className="mx-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center md:mx-0">
          <p className="mb-4 font-semibold text-gray-700">No encontramos productos</p>
          <button
            type="button"
            onClick={() => {
              clearFilters();
              setSearch('');
              setCategory('');
            }}
            className="h-11 rounded-xl bg-gray-900 px-5 text-sm font-bold text-white"
          >
            Ver todo el catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 sm:grid-cols-3 md:px-0 lg:grid-cols-4">
          {results.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      )}

      {/* Hoja de filtros */}
      {sheetOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="safe-bottom-3 absolute inset-x-0 bottom-0 mx-auto flex max-h-[85dvh] max-w-xl flex-col rounded-t-3xl bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
              <button
                type="button"
                onClick={clearFilters}
                className="h-11 text-sm font-semibold text-pink-600"
              >
                Limpiar
              </button>
              <p className="font-bold text-gray-900">Filtros</p>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Cerrar filtros"
                className="flex h-11 w-11 items-center justify-end text-gray-500"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto overscroll-contain p-4">
              <fieldset>
                <legend className="mb-2 text-sm font-bold text-gray-900">Talla de calzado</legend>
                <div className="grid grid-cols-5 gap-2">
                  {TALLAS_CALZADO.map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={sizes.includes(size)}
                      onClick={() => toggleSize(size)}
                      className={`h-11 rounded-xl border text-sm font-semibold ${
                        sizes.includes(size)
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <legend className="mb-2 text-sm font-bold text-gray-900">Talla de ropa</legend>
                <div className="grid grid-cols-5 gap-2">
                  {TALLAS_ROPA.map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={sizes.includes(size)}
                      onClick={() => toggleSize(size)}
                      className={`h-11 rounded-xl border text-sm font-semibold ${
                        sizes.includes(size)
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-900">
                  Precio máximo (Bs.)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Sin límite"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-11 w-full rounded-xl border border-gray-200 px-3 outline-none focus:border-pink-600"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-gray-900">Ordenar por</span>
                <select
                  value={orden}
                  onChange={(e) => setOrden(e.target.value as Orden)}
                  className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 outline-none"
                >
                  <option value="relevancia">Destacados</option>
                  <option value="menor">Menor precio</option>
                  <option value="mayor">Mayor precio</option>
                </select>
              </label>
            </div>

            <div className="px-4 pt-3">
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="h-12 w-full rounded-xl bg-gray-900 font-bold text-white active:bg-black"
              >
                Ver {results.length} {results.length === 1 ? 'producto' : 'productos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      <CatalogContent />
    </Suspense>
  );
}
