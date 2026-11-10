import type { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — Clic Moda SCZ',
  description:
    'Conocé la historia, misión y valores de Clic Moda SCZ, la tienda de fast fashion de Santa Cruz.',
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
    descripcion:
      'Nacimos en Santa Cruz para Santa Cruz. Entendemos el calor, los ritmos y el estilo cruceño.',
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
    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-pink-600 text-xl font-black text-white shadow-lg">
      {initials}
    </div>
  );
}

export default function NosotrosPage() {
  return (
    <div className="bg-gray-50 pb-20 md:pb-0">
      {/* Hero oscuro */}
      <div className="bg-gray-900 px-4 py-16 text-center text-white md:py-24">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-pink-600 shadow-lg shadow-pink-600/30">
          <Info className="h-12 w-12 text-white" />
        </div>
        <h1 className="mb-4 text-4xl font-black tracking-tight md:text-5xl">Sobre Nuestra Marca</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-400 md:text-xl">
          Revolucionando el <strong className="text-white">Fast Fashion</strong> digital en Bolivia.
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        {/* Historia */}
        <div className="mb-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-600">
              Nuestra historia
            </div>
            <h2 className="text-3xl leading-tight font-black text-gray-900 md:text-4xl">
              Nació de una necesidad,
              <br />
              <span className="text-pink-600">creció con pasión</span>
            </h2>
            <p className="leading-relaxed text-gray-600">
              Clic Moda SCZ nació en 2024 con una idea simple: hacer que la moda trendy sea
              accesible para todas las cruceñas sin las complicaciones de un e-commerce tradicional.
            </p>
            <p className="leading-relaxed text-gray-600">
              Empezamos vendiendo por TikTok e Instagram, coordinando entregas por WhatsApp. Hoy
              tenemos una plataforma propia que mantiene esa misma cercanía, pero con la comodidad
              de un catálogo digital con tallas exactas.
            </p>
          </div>
          <div className="flex aspect-square max-h-80 items-center justify-center rounded-3xl border border-gray-100 bg-white text-8xl shadow-sm">
            👗
          </div>
        </div>

        {/* Misión */}
        <div className="mb-16 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm md:p-12">
          <p className="mb-4 text-sm font-bold tracking-widest text-pink-600 uppercase">
            Nuestra misión
          </p>
          <blockquote className="mx-auto max-w-3xl text-2xl leading-relaxed font-black text-gray-900 md:text-3xl">
            &ldquo;Ser el destino de moda favorito de Santa Cruz, donde cada compra es{' '}
            <span className="text-pink-600">rápida, confiable y sin sorpresas</span>.&rdquo;
          </blockquote>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="mb-10 text-center text-3xl font-black text-gray-900">Lo que nos define</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {VALORES.map((valor) => (
              <div
                key={valor.titulo}
                className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <span className="shrink-0 text-3xl">{valor.emoji}</span>
                <div>
                  <h3 className="mb-1 text-lg font-black text-gray-900">{valor.titulo}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{valor.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo */}
        <div className="mb-16">
          <h2 className="mb-10 text-center text-3xl font-black text-gray-900">El equipo</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {EQUIPO.map((persona) => (
              <div
                key={persona.nombre}
                className="flex flex-col items-center gap-4 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
              >
                <Avatar nombre={persona.nombre} />
                <div>
                  <p className="font-bold text-gray-900">{persona.nombre}</p>
                  <p className="text-sm text-gray-500">{persona.rol}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="mb-6 text-2xl font-black text-gray-900">
            ¿Lista para descubrir tu próximo look?
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={ROUTES.CATALOG}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-900 px-8 font-bold text-white transition-colors hover:bg-pink-600"
            >
              Ver catálogo →
            </Link>
            <Link
              href={ROUTES.CONTACT}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-gray-200 bg-white px-8 font-bold text-gray-700 transition-colors hover:border-gray-400"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
