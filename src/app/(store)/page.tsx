import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inicio — Clic Moda SCZ',
};

/**
 * HomePage — Sprint 0: Placeholder.
 * Se construirá con HeroBanner, FlashSaleTimer y grillas en Sprint 1.
 */
export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] gap-8 px-6 py-16 text-center animate-fade-in">
      {/* Hero placeholder */}
      <div className="space-y-4 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] text-[var(--color-brand)] text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-[var(--color-brand)] animate-pulse" />
          Fast Fashion · Santa Cruz
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          Tu moda,{' '}
          <span className="gradient-text">un click</span>{' '}
          de distancia
        </h1>

        <p className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto">
          Ropa trendy con tallas exactas, pagos simples y coordinación de
          entrega por WhatsApp. ¡Sin complicaciones!
        </p>
      </div>

      {/* CTAs placeholder */}
      <div className="flex flex-col sm:flex-row gap-4">
        <a
          href="/catalogo"
          id="cta-ver-catalogo"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold text-white transition-all"
          style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-brand)' }}
        >
          Ver catálogo →
        </a>
        <a
          href="/login"
          id="cta-iniciar-sesion"
          className="inline-flex items-center justify-center h-12 px-8 rounded-xl font-semibold border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-all"
        >
          Iniciar sesión
        </a>
      </div>

      {/* Sprint notice */}
      <div className="mt-12 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-xs text-[var(--color-text-muted)] max-w-md">
        🚧 <strong className="text-[var(--color-text-secondary)]">Sprint 0 completado.</strong>{' '}
        Estructura base, modelos TypeScript, Zustand stores y Mock Backend están listos.
        El catálogo completo se construye en Sprint 1.
      </div>
    </section>
  );
}
