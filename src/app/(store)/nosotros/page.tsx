import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — Clic Moda SCZ',
  description: 'Conocé la historia, misión y valores de Clic Moda SCZ, la tienda de fast fashion de Santa Cruz.',
};

const VALORES = [
  {
    emoji: '⚡',
    titulo: 'Velocidad',
    descripcion: 'Tendencias nuevas cada semana. Nunca te quedás atrás de la moda.',
  },
  {
    emoji: '📏',
    titulo: 'Precisión',
    descripcion: 'Medidas exactas por talla en cada prenda. Comprás sabiendo qué te va a quedar.',
  },
  {
    emoji: '💬',
    titulo: 'Cercanía',
    descripcion: 'Coordinación por WhatsApp. Sin call centers, sin bots: persona a persona.',
  },
  {
    emoji: '🌿',
    titulo: 'Local',
    descripcion: 'Nacimos en Santa Cruz para Santa Cruz. Entendemos el calor, los ritmos y el estilo cruceño.',
  },
];

const EQUIPO = [
  { nombre: 'Ana García', rol: 'Fundadora y Gerente General' },
  { nombre: 'Carlos Méndez', rol: 'Logística y Despacho' },
  { nombre: 'Laura Vargas', rol: 'Atención al Cliente' },
];

function Avatar({ nombre }: { nombre: string }) {
  const initials = nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('');

  return (
    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-[var(--gradient-brand)] text-2xl font-bold text-white shadow-[var(--shadow-brand)]">
      {initials}
    </div>
  );
}

export default function NosotrosPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-16">
      <section className="grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-6 text-center lg:text-left animate-fade-in">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-subtle)] px-3 py-1 text-sm font-medium text-[var(--color-brand)]">
            Nuestra historia
          </div>
          <h1 className="text-4xl font-bold leading-tight text-[var(--color-text-primary)] sm:text-5xl">
            Nació de una necesidad,<br />
            <span className="gradient-text">creció con pasión</span>
          </h1>
          <p className="leading-8 text-[var(--color-text-secondary)]">
            Clic Moda SCZ nació en 2024 con una idea simple: hacer que la moda trendy sea accesible
            para todas las cruceñas sin las complicaciones de un e-commerce tradicional.
          </p>
          <p className="leading-8 text-[var(--color-text-secondary)]">
            Empezamos vendiendo por TikTok e Instagram, coordinando entregas por WhatsApp.
            Hoy tenemos una plataforma propia que mantiene esa misma cercanía, pero con la comodidad
            de un catálogo digital con tallas exactas.
          </p>
        </div>

        <div className="flex aspect-square items-center justify-center rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] text-8xl shadow-[var(--shadow-md)]">
          👗
        </div>
      </section>

      <section
        className="rounded-3xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] p-8 text-center shadow-[var(--shadow-md)] sm:p-10"
      >
        <p className="mb-4 text-sm font-medium text-[var(--color-brand)]">Nuestra misión</p>
        <blockquote className="mx-auto max-w-3xl text-2xl font-semibold leading-relaxed text-[var(--color-text-primary)] md:text-3xl">
          &ldquo;Ser el destino de moda favorito de Santa Cruz, donde cada compra es{' '}
          <span className="gradient-text">rápida, confiable y sin sorpresas</span>.&rdquo;
        </blockquote>
      </section>

      <section>
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--color-text-primary)]">Lo que nos define</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {VALORES.map((valor) => (
            <div
              key={valor.titulo}
              className="flex gap-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
            >
              <span className="text-3xl shrink-0">{valor.emoji}</span>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-[var(--color-text-primary)]">{valor.titulo}</h3>
                <p className="text-[var(--color-text-secondary)]">{valor.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-12 text-center text-3xl font-bold text-[var(--color-text-primary)]">El equipo</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {EQUIPO.map((persona) => (
            <div key={persona.nombre} className="flex flex-col items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-sm)]">
              <Avatar nombre={persona.nombre} />
              <div>
                <p className="font-semibold text-[var(--color-text-primary)]">{persona.nombre}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{persona.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 text-center">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">¿Lista para descubrir tu próximo look?</h2>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={ROUTES.CATALOG}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--gradient-brand)] px-6 font-semibold text-white shadow-[var(--shadow-brand)] transition-transform hover:-translate-y-0.5"
          >
            Ver catálogo →
          </Link>
          <Link
            href="/contacto"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-[var(--color-border)] bg-white px-6 font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
          >
            Contactanos
          </Link>
        </div>
      </section>

    </div>
  );
}
