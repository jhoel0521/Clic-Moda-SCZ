import type { Metadata } from 'next';
import { MockProductService } from '@src/mocks/services/MockProductService';
import { ProductCard } from '@src/shared/ui/ProductCard';

export const metadata: Metadata = {
  title: 'Catálogo — Clic Moda SCZ',
  description: 'Explorá toda nuestra colección de ropa trendy con tallas exactas.',
};

const CATEGORIAS = ['vestidos', 'blusas', 'pantalones', 'conjuntos', 'chaquetas', 'faldas', 'accesorios'];
const TALLAS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default async function CatalogPage() {
  const products = await MockProductService.getProducts();
  const activeProducts = products.filter((p) => p.estado === 'activo');

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-14">
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <p className="mb-3 inline-flex rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
          Catálogo
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-5xl">
          Encontrá prendas que sí te quedan
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg">
          {activeProducts.length} productos disponibles, con fotos claras, tallas exactas y navegación simple.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
            <p className="mb-5 text-sm font-semibold text-[var(--color-text-primary)]">Filtros</p>

            <div className="mb-6">
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Categoría
              </p>
              <div className="space-y-2">
                {CATEGORIAS.map((cat) => (
                  <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm capitalize text-[var(--color-text-secondary)]">
                    <input type="checkbox" className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-brand)] focus:ring-[var(--color-brand)]" />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6 h-px bg-[var(--color-border)]" />

            <div>
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Talla
              </p>
              <div className="flex flex-wrap gap-2">
                {TALLAS.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          {activeProducts.length === 0 ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center text-[var(--color-text-muted)] shadow-[var(--shadow-sm)]">
              No hay productos disponibles.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {activeProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index === 0} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
