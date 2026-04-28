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
  {
    numero: '01',
    titulo: 'Explorá el catálogo',
    descripcion: 'Filtrá por talla, color o categoría. Consultá las medidas exactas de cada prenda antes de comprar.',
  },
  {
    numero: '02',
    titulo: 'Añadí al carrito',
    descripcion: 'Sin registro obligatorio. Completá tu pedido como invitado o con tu cuenta en segundos.',
  },
  {
    numero: '03',
    titulo: 'Coordiná por WhatsApp',
    descripcion: 'Te enviamos un ticket con tu pedido y coordinamos la entrega directamente por chat.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <section className="relative flex min-h-[calc(100vh-4rem)] w-full items-center justify-center overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 -z-10 bg-[var(--gradient-hero)]" />
        <div className="absolute left-1/2 top-1/2 -z-10 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gradient-brand)] opacity-15 blur-3xl" />

        <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--color-brand)]">
            <span className="inline-block h-2 w-2 animate-pulse-brand rounded-full bg-[var(--color-brand)]" />
            Fast Fashion · Santa Cruz de la Sierra
          </div>

          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl">
            Tu moda, <span className="gradient-text">un click</span> de distancia
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">
            Ropa trendy con tallas exactas, pagos simples y entrega coordinada por WhatsApp.
            Sin complicaciones, directo a tu puerta.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={ROUTES.CATALOG}
              className="inline-flex h-14 items-center justify-center rounded-xl bg-[var(--gradient-brand)] px-8 text-lg font-semibold text-white shadow-[var(--shadow-brand)] transition-transform duration-200 hover:-translate-y-0.5 hover:opacity-95"
            >
              Explorar catálogo →
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex h-14 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-8 font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--color-bg-secondary)] px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            Explora por categoría
          </h2>
          <p className="mb-12 text-center text-[var(--color-text-secondary)]">
            Encuentra exactamente lo que buscas
          </p>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.nombre}
                href={cat.href}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-8 text-center transition-all hover:-translate-y-1 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-md)]"
              >
                <span className="text-5xl">{cat.emoji}</span>
                <div>
                  <p className="text-lg font-semibold text-[var(--color-text-primary)] transition-colors group-hover:text-[var(--color-brand)]">
                    {cat.nombre}
                  </p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {cat.descripcion}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ──────────────────────────────────────── */}
      <section className="w-full px-6 py-20">
        <div className="mx-auto w-full max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mb-12 text-center text-[var(--color-text-secondary)]">
            Comprar en Clic Moda es así de simple
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {PASOS.map((paso) => (
              <div
                key={paso.numero}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-sm)]"
              >
                <span className="gradient-text text-4xl font-black">
                  {paso.numero}
                </span>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)]">{paso.titulo}</h3>
                <p className="leading-7 text-[var(--color-text-secondary)]">{paso.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full bg-[var(--color-bg-secondary)] px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-[var(--color-text-primary)] sm:text-4xl">
            ¿Querés saber más sobre nosotros?
          </h2>
          <p className="mb-8 text-[var(--color-text-secondary)] leading-7">
            Conocé nuestra historia, misión y los valores que nos mueven como negocio local de Santa Cruz.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={ROUTES.CATALOG}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--gradient-brand)] px-6 font-semibold text-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5"
            >
              Ver catálogo
            </Link>
            <Link
              href={ROUTES.ABOUT}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            >
              Sobre nosotros
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
