import type { Metadata } from 'next';
import Link from 'next/link';
import { Info } from 'lucide-react';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Sobre Nosotros — Clic Moda SCZ',
  description: 'Conocé la historia, misión y valores de Clic Moda SCZ, la tienda de fast fashion de Santa Cruz.',
};

const VALORES = [
  { emoji: '⚡', titulo: 'Velocidad', descripcion: 'Tendencias nuevas cada semana. Nunca te quedás atrás de la moda.' },
  { emoji: '📏', titulo: 'Precisión', descripcion: 'Medidas exactas por talla en cada prenda. Comprás sabiendo qué te va a quedar.' },
  { emoji: '💬', titulo: 'Cercanía', descripcion: 'Coordinación por WhatsApp. Sin call centers, sin bots: persona a persona.' },
  { emoji: '🌿', titulo: 'Local', descripcion: 'Nacimos en Santa Cruz para Santa Cruz. Entendemos el calor, los ritmos y el estilo cruceño.' },
];

const EQUIPO = [
  { nombre: 'Ana García', rol: 'Fundadora y Gerente General' },
  { nombre: 'Carlos Méndez', rol: 'Logística y Despacho' },
  { nombre: 'Laura Vargas', rol: 'Atención al Cliente' },
];

function Avatar({ nombre }: { nombre: string }) {
  const initials = nombre.split(' ').slice(0, 2).map((n) => n[0]).join('');
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
      <div className="bg-gray-900 text-white py-16 md:py-24 text-center px-4">
        <div className="w-24 h-24 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-600/30">
          <Info className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Sobre Nuestra Marca</h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Revolucionando el <strong className="text-white">Fast Fashion</strong> digital en Bolivia.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16">

        {/* Historia */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-pink-50 border border-pink-100 px-4 py-1.5 text-sm font-medium text-pink-600">
              Nuestra historia
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              Nació de una necesidad,<br />
              <span className="text-pink-600">creció con pasión</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Clic Moda SCZ nació en 2024 con una idea simple: hacer que la moda trendy sea accesible
              para todas las cruceñas sin las complicaciones de un e-commerce tradicional.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Empezamos vendiendo por TikTok e Instagram, coordinando entregas por WhatsApp.
              Hoy tenemos una plataforma propia que mantiene esa misma cercanía, pero con la comodidad
              de un catálogo digital con tallas exactas.
            </p>
          </div>
          <div className="flex items-center justify-center aspect-square max-h-80 rounded-3xl bg-white border border-gray-100 shadow-sm text-8xl">
            👗
          </div>
        </div>

        {/* Misión */}
        <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-12 text-center shadow-sm mb-16">
          <p className="text-sm font-bold text-pink-600 mb-4 uppercase tracking-widest">Nuestra misión</p>
          <blockquote className="text-2xl md:text-3xl font-black text-gray-900 leading-relaxed max-w-3xl mx-auto">
            &ldquo;Ser el destino de moda favorito de Santa Cruz, donde cada compra es{' '}
            <span className="text-pink-600">rápida, confiable y sin sorpresas</span>.&rdquo;
          </blockquote>
        </div>

        {/* Valores */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10">Lo que nos define</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {VALORES.map((valor) => (
              <div
                key={valor.titulo}
                className="flex gap-5 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
              >
                <span className="text-3xl shrink-0">{valor.emoji}</span>
                <div>
                  <h3 className="font-black text-lg text-gray-900 mb-1">{valor.titulo}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{valor.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipo */}
        <div className="mb-16">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-10">El equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {EQUIPO.map((persona) => (
              <div
                key={persona.nombre}
                className="flex flex-col items-center gap-4 bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm"
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
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            ¿Lista para descubrir tu próximo look?
          </h2>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={ROUTES.CATALOG}
              className="inline-flex items-center justify-center h-12 px-8 bg-gray-900 hover:bg-pink-600 text-white font-bold rounded-xl transition-colors"
            >
              Ver catálogo →
            </Link>
            <Link
              href={ROUTES.CONTACT}
              className="inline-flex items-center justify-center h-12 px-8 border border-gray-200 bg-white text-gray-700 font-bold rounded-xl hover:border-gray-400 transition-colors"
            >
              Contactanos
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
