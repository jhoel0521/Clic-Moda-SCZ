import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Clic Moda SCZ — Fast Fashion Santa Cruz',
  description:
    'Ropa trendy con tallas exactas y entrega coordinada por WhatsApp. Compra rápido, llegá con estilo.',
};

const CATEGORIAS = [
  { nombre: 'Vestidos', emoji: '👗', href: `${ROUTES.CATALOG}?categoria=vestidos`, descripcion: 'Para cada ocasión' },
  { nombre: 'Conjuntos', emoji: '✨', href: `${ROUTES.CATALOG}?categoria=conjuntos`, descripcion: 'Looks completos' },
  { nombre: 'Accesorios', emoji: '👜', href: `${ROUTES.CATALOG}?categoria=accesorios`, descripcion: 'El toque final' },
];

const PASOS = [
  { numero: '01', titulo: 'Explorá el catálogo', descripcion: 'Filtrá por talla, color o categoría. Consultá las medidas exactas de cada prenda antes de comprar.' },
  { numero: '02', titulo: 'Añadí al carrito', descripcion: 'Sin registro obligatorio. Completá tu pedido como invitado o con tu cuenta en segundos.' },
  { numero: '03', titulo: 'Coordiná por WhatsApp', descripcion: 'Te enviamos un ticket con tu pedido y coordinamos la entrega directamente por chat.' },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-6 py-20 overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'var(--gradient-hero)' }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full -z-10 blur-3xl opacity-20"
          style={{ background: 'var(--gradient-brand)' }}
        />

        <div className="animate-fade-in space-y-6 max-w-3xl">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium"
            style={{ borderColor: 'var(--color-border-brand)', backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse-brand" style={{ backgroundColor: 'var(--color-brand)' }} />
            Fast Fashion · Santa Cruz de la Sierra
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            Tu moda,{' '}
            <span className="gradient-text">un click</span>{' '}
            de distancia
          </h1>

          <p className="text-xl max-w-xl mx-auto leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Ropa trendy con tallas exactas, pagos simples y entrega coordinada por WhatsApp.
            Sin complicaciones, directo a tu puerta.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href={ROUTES.CATALOG}
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl font-semibold text-white text-lg transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'var(--gradient-brand)', boxShadow: 'var(--shadow-brand)' }}
            >
              Explorar catálogo →
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl font-semibold border transition-all"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      {/* ── CATEGORÍAS DESTACADAS ─────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">Explora por categoría</h2>
          <p className="text-center mb-12" style={{ color: 'var(--color-text-secondary)' }}>
            Encuentra exactamente lo que buscas
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.nombre}
                href={cat.href}
                className="group flex flex-col items-center gap-4 p-8 rounded-2xl border transition-all"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
              >
                <span className="text-5xl">{cat.emoji}</span>
                <div className="text-center">
                  <p className="font-semibold text-lg group-hover:text-[var(--color-brand)] transition-colors">{cat.nombre}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{cat.descripcion}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ─────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">¿Cómo funciona?</h2>
          <p className="text-center mb-12" style={{ color: 'var(--color-text-secondary)' }}>
            Comprar en Clic Moda es así de simple
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PASOS.map((paso) => (
              <div key={paso.numero} className="flex flex-col gap-4">
                <span className="text-5xl font-black gradient-text">{paso.numero}</span>
                <h3 className="text-xl font-semibold">{paso.titulo}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">¿Querés saber más sobre nosotros?</h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Conocé nuestra historia, misión y los valores que nos mueven como negocio local de Santa Cruz.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={ROUTES.CATALOG}
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'var(--gradient-brand)' }}
            >
              Ver catálogo
            </Link>
            <Link
              href="/nosotros"
              className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-semibold border transition-all"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Sobre nosotros
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
