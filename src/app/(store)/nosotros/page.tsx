import type { Metadata } from 'next';
import Link from 'next/link';
import { Footprints, MessageCircle, Ruler } from 'lucide-react';
import { ROUTES } from '@src/routes';

export const metadata: Metadata = {
  title: 'Nosotros',
  description: 'Texto de ejemplo para presentar la marca en la demo.',
};

const VALORES = [
  {
    icon: Footprints,
    titulo: 'Diseño propio',
    descripcion: 'Espacio para contar qué hace única a la marca y cómo se fabrica cada par.',
  },
  {
    icon: Ruler,
    titulo: 'Talla exacta',
    descripcion: 'Guía con el largo del pie para comprar sin miedo a equivocarse.',
  },
  {
    icon: MessageCircle,
    titulo: 'Trato directo',
    descripcion: 'Cada pedido se coordina por WhatsApp, persona a persona.',
  },
];

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 md:py-12">
      <p className="mb-1 text-xs font-bold tracking-widest text-pink-600 uppercase">
        Texto de ejemplo
      </p>
      <h1 className="mb-3 text-2xl font-black text-gray-900 md:text-4xl">Nuestra marca</h1>
      <p className="mb-6 text-gray-600">
        Acá va la historia real del negocio: cómo nació, qué zapatos hace y por qué la gente la
        elige. La demo muestra el espacio; el contenido lo pone la marca.
      </p>

      <div className="mb-8 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
        {VALORES.map(({ icon: Icon, titulo, descripcion }) => (
          <div key={titulo} className="flex gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600">
              <Icon size={20} />
            </span>
            <span>
              <span className="block font-bold text-gray-900">{titulo}</span>
              <span className="block text-sm text-gray-500">{descripcion}</span>
            </span>
          </div>
        ))}
      </div>

      <Link
        href={ROUTES.CATALOG}
        className="flex h-12 items-center justify-center rounded-xl bg-gray-900 font-bold text-white"
      >
        Ver catálogo
      </Link>
    </div>
  );
}
