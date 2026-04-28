import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@src/routes';
import { HeroCarousel } from '@src/shared/ui/HeroCarousel'; // Importamos el carrusel!

export const metadata: Metadata = {
  title: 'Clic Moda SCZ — Fast Fashion Santa Cruz',
  description: 'Ropa trendy con tallas exactas y entrega coordinada por WhatsApp.',
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
    descripcion: 'Filtrá por talla o categoría. Consultá las medidas exactas de cada prenda antes de comprar.',
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
    <div className="flex flex-col w-full items-center bg-white">

      {/* 1. Nuestro Nuevo Carrusel */}
      <HeroCarousel />

      {/* 2. Sección de Categorías */}
      <section className="w-full bg-gray-50 px-6 py-20 flex flex-col items-center">
        <div className="w-full max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Explora por categoría
          </h2>
          <p className="mb-12 text-center text-gray-500 text-lg">
            Encuentra exactamente lo que buscas
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.nombre}
                href={cat.href}
                className="group flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-10 text-center shadow-sm transition-all hover:-translate-y-2 hover:border-pink-300 hover:shadow-xl"
              >
                <span className="text-6xl transition-transform group-hover:scale-110">{cat.emoji}</span>
                <div>
                  <p className="text-xl font-bold text-gray-800 transition-colors group-hover:text-pink-600">
                    {cat.nombre}
                  </p>
                  <p className="mt-2 text-sm text-gray-500">
                    {cat.descripcion}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Sección ¿Cómo Funciona? */}
      <section className="w-full px-6 py-24 flex flex-col items-center bg-white">
        <div className="w-full max-w-6xl">
          <h2 className="mb-2 text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            ¿Cómo funciona?
          </h2>
          <p className="mb-16 text-center text-gray-500 text-lg">
            Comprar en Clic Moda es así de simple
          </p>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {PASOS.map((paso) => (
              <div
                key={paso.numero}
                className="relative flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-10 shadow-lg"
              >
                <span className="text-6xl font-black text-pink-100 absolute top-6 right-8 z-0">
                  {paso.numero}
                </span>
                <div className="z-10 mt-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{paso.titulo}</h3>
                  <p className="leading-relaxed text-gray-600">{paso.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Sección Sobre Nosotros */}
      <section className="w-full bg-pink-50 px-6 py-24 flex flex-col items-center">
        <div className="w-full max-w-2xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl">
            ¿Querés saber más sobre nosotros?
          </h2>
          <p className="mb-10 text-gray-600 text-lg leading-relaxed">
            Conocé nuestra historia, misión y los valores que nos mueven como negocio local de Santa Cruz. Moda accesible y rápida para todos.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={ROUTES.ABOUT}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-900 px-8 font-bold text-white shadow-md transition-all hover:bg-gray-800 hover:-translate-y-1"
            >
              Sobre nosotros
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}