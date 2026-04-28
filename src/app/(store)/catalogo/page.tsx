import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catálogo — Clic Moda SCZ',
  description: 'Explorá toda nuestra colección de ropa trendy con tallas exactas.',
};

/**
 * CatalogPage — Sprint 1.
 * Se implementará con SidebarFilters, ProductCard y paginación.
 */
export default function CatalogPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Catálogo</h1>
        <p style={{ color: 'var(--color-text-secondary)' }}>
          Explorá nuestra colección completa de ropa y accesorios
        </p>
      </div>

      {/* Buscador placeholder */}
      <div className="flex gap-4 mb-8">
        <div
          className="flex-1 h-12 rounded-xl border px-4 flex items-center gap-3"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
        >
          <span style={{ color: 'var(--color-text-muted)' }}>🔍</span>
          <span style={{ color: 'var(--color-text-muted)' }}>Buscar vestidos, blusas, jeans...</span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Filtros sidebar placeholder */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div
            className="rounded-2xl border p-6 space-y-4"
            style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
          >
            <p className="font-semibold">Filtros</p>
            {['Categoría', 'Precio', 'Talla', 'Color'].map((filtro) => (
              <div key={filtro} className="space-y-2">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{filtro}</p>
                <div className="h-8 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
              </div>
            ))}
          </div>
        </aside>

        {/* Grid de productos placeholder — Sprint 1 */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
            >
              <div className="aspect-[3/4] animate-pulse" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
              <div className="p-4 space-y-2">
                <div className="h-4 rounded animate-pulse w-3/4" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
                <div className="h-4 rounded animate-pulse w-1/2" style={{ backgroundColor: 'var(--color-surface-hover)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="mt-12 p-4 rounded-xl border text-center text-sm"
        style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
      >
        🚧 <strong style={{ color: 'var(--color-text-secondary)' }}>Sprint 1.</strong>{' '}
        El catálogo completo con filtros y productos reales se implementa en Sprint 1.
      </div>
    </div>
  );
}
