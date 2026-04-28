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
  { nombre: 'Ana García', rol: 'Fundadora y Gerente General', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana' },
  { nombre: 'Carlos Méndez', rol: 'Logística y Despacho', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos' },
  { nombre: 'Laura Vargas', rol: 'Atención al Cliente', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=laura' },
];

export default function NosotrosPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-20">

      {/* ── HISTORIA ─────────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 animate-fade-in">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: 'var(--color-brand-subtle)', color: 'var(--color-brand)' }}
          >
            Nuestra historia
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Nació de una necesidad,<br />
            <span className="gradient-text">creció con pasión</span>
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
            Clic Moda SCZ nació en 2024 con una idea simple: hacer que la moda trendy sea accesible
            para todas las cruceñas sin las complicaciones de un e-commerce tradicional.
          </p>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.8' }}>
            Empezamos vendiendo por TikTok e Instagram, coordinando entregas por WhatsApp.
            Hoy tenemos una plataforma propia que mantiene esa misma cercanía, pero con la comodidad
            de un catálogo digital con tallas exactas.
          </p>
        </div>

        {/* Decoración visual */}
        <div
          className="aspect-square rounded-3xl flex items-center justify-center text-8xl"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          👗
        </div>
      </section>

      {/* ── MISIÓN ───────────────────────────────────────────────── */}
      <section
        className="rounded-3xl p-10 text-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border-brand)' }}
      >
        <p className="text-sm font-medium mb-4" style={{ color: 'var(--color-brand)' }}>Nuestra misión</p>
        <blockquote className="text-2xl md:text-3xl font-semibold leading-relaxed max-w-3xl mx-auto">
          &ldquo;Ser el destino de moda favorito de Santa Cruz, donde cada compra es{' '}
          <span className="gradient-text">rápida, confiable y sin sorpresas</span>.&rdquo;
        </blockquote>
      </section>

      {/* ── VALORES ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">Lo que nos define</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {VALORES.map((valor) => (
            <div
              key={valor.titulo}
              className="flex gap-5 p-6 rounded-2xl border"
              style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
            >
              <span className="text-3xl shrink-0">{valor.emoji}</span>
              <div>
                <h3 className="font-semibold text-lg mb-1">{valor.titulo}</h3>
                <p style={{ color: 'var(--color-text-secondary)' }}>{valor.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── EQUIPO ───────────────────────────────────────────────── */}
      <section>
        <h2 className="text-3xl font-bold text-center mb-12">El equipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {EQUIPO.map((persona) => (
            <div key={persona.nombre} className="flex flex-col items-center gap-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={persona.avatar}
                alt={persona.nombre}
                className="w-24 h-24 rounded-full"
                style={{ backgroundColor: 'var(--color-surface-raised)', border: '2px solid var(--color-border)' }}
              />
              <div>
                <p className="font-semibold">{persona.nombre}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{persona.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="text-center space-y-6">
        <h2 className="text-2xl font-bold">¿Lista para descubrir tu próximo look?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={ROUTES.CATALOG}
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'var(--gradient-brand)' }}
          >
            Ver catálogo →
          </Link>
          <Link
            href="/contacto"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl font-semibold border transition-all"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            Contactanos
          </Link>
        </div>
      </section>

    </div>
  );
}
