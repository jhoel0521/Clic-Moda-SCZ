import type { Metadata } from 'next';
import Link from 'next/link';
import { ROUTES } from '@src/routes';
import { HeroCarousel } from '@src/shared/ui/HeroCarousel';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { FlashSaleTimer } from '@src/shared/ui/FlashSaleTimer';
import { MockProductService } from '@src/mocks/services/MockProductService';

export const metadata: Metadata = {
  title: 'Clic Moda SCZ — Fast Fashion Santa Cruz',
  description: 'Ropa trendy con tallas exactas y entrega coordinada por WhatsApp.',
};

const CATEGORIAS = [
  {
    nombre: 'Vestidos & Faldas',
    img: 'https://images.unsplash.com/photo-1559034750-cdab70a66b8e?q=80&w=800&auto=format&fit=crop',
    href: `${ROUTES.CATALOG}?categoria=vestidos`,
  },
  {
    nombre: 'Tops & Blusas',
    img: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=800&auto=format&fit=crop',
    href: `${ROUTES.CATALOG}?categoria=tops`,
  },
  {
    nombre: 'Urbano & Denim',
    img: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?q=80&w=800&auto=format&fit=crop',
    href: `${ROUTES.CATALOG}?categoria=denim`,
  },
];

export default async function LandingPage() {
  const flashProducts = await MockProductService.getFlashSaleProducts();

  return (
    <>
      {/* 1. Carrusel */}
      <HeroCarousel />

      {/* 2. Ventas Flash */}
      {flashProducts.length > 0 && (
        <section className="w-full bg-[var(--color-bg-secondary)] px-6 py-16 flex flex-col items-center">
          <div className="w-full max-w-[1400px]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 className="text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                  ⚡ Ventas Flash
                </h2>
                <p className="mt-1 text-[var(--color-text-muted)] text-sm">Ofertas por tiempo limitado</p>
              </div>
              <FlashSaleTimer endsAt={flashProducts[0].flashSaleEndsAt!} />
            </div>

            <div className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {flashProducts.map((product, i) => (
                <div key={product.id} className="snap-start shrink-0 w-52 sm:w-60">
                  <ProductCard product={product} priority={i === 0} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. Colecciones */}
      <section className="w-full bg-white px-6 py-24 flex flex-col items-center">
        <div className="w-full max-w-[1400px]">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight sm:text-4xl">Colecciones</h2>
              <p className="mt-2 text-gray-500">Encuentra tu estilo ideal para esta temporada.</p>
            </div>
            <Link href={ROUTES.CATALOG} className="hidden sm:block text-[var(--color-brand)] font-bold hover:underline">
              Ver todo el catálogo →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {CATEGORIAS.map((cat) => (
              <Link
                key={cat.nombre}
                href={cat.href}
                className="group relative h-96 w-full overflow-hidden rounded-2xl bg-gray-100"
              >
                <img
                  src={cat.img}
                  alt={cat.nombre}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8">
                  <h3 className="text-2xl font-bold text-white">{cat.nombre}</h3>
                  <p className="mt-2 text-sm font-medium text-pink-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Explorar colección &rarr;
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <Link href={ROUTES.CATALOG} className="mt-8 block text-center sm:hidden text-[var(--color-brand)] font-bold hover:underline">
            Ver todo el catálogo →
          </Link>
        </div>
      </section>

      {/* 4. ¿Cómo Funciona? */}
      <section className="w-full bg-gray-50 px-6 py-24 flex flex-col items-center">
        <div className="w-full max-w-[1200px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">Comprar nunca fue tan fácil</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Elige tu ropa</h3>
              <p className="text-gray-600">Revisa las medidas exactas en centímetros. Añade al carrito sin necesidad de registrarte.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                <span className="text-2xl">📝</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Llena tus datos</h3>
              <p className="text-gray-600">Proporciona tu dirección de envío en Santa Cruz de forma rápida y segura.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                <span className="text-2xl">📲</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Coordina por WhatsApp</h3>
              <p className="text-gray-600">Genera tu ticket y chatea directamente con nosotros para coordinar el pago y la entrega.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
