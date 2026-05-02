import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Filter, Star } from 'lucide-react';
import { ROUTES } from '@src/routes';
import { HeroCarousel } from '@src/shared/ui/HeroCarousel';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { ProductService } from '@src/services/ProductService';
import { FlashSaleBanner } from '@src/shared/ui/FlashSaleBanner';

export const metadata: Metadata = {
  title: 'Clic Moda SCZ — Fast Fashion Santa Cruz',
  description: 'Ropa trendy con tallas exactas y entrega coordinada por WhatsApp.',
};

const CATEGORIAS = ['Jeans', 'Blusas', 'Vestidos', 'Poleras', 'Accesorios'];
const ETIQUETAS = ['Aesthetic', 'Oversize', 'Verano 2026', 'Y2K'];

const COLECCIONES = [
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
  const flashProducts = await ProductService.getFlashSaleProducts();

  return (
    <div className="flex w-full flex-col items-center justify-start gap-8 bg-gray-50">
      {/* ++++++++++++++++++ HERO CENTRADO ++++++++++++++++++ */}
      <div className="mx-auto mt-4 mt-6 w-full max-w-[1200px] md:mt-8">
        <HeroCarousel />
      </div>

      {/* ++++++++++++++++++ CONTENIDO PRINCIPAL ++++++++++++++++++ */}
      <main className="mx-auto mt-8 flex w-full max-w-[1200px] flex-col gap-12 px-4 sm:px-6 md:mt-12 md:gap-20 lg:px-8">
        {/* 2. Banner ventas flash */}
        {flashProducts.length > 0 && <FlashSaleBanner products={flashProducts} />}

        {/* 3. Categorías + Tendencias (Grid 2 columnas) */}
        <section className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {/* Categorías */}
          <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900">
              <span className="rounded-xl bg-pink-100 p-2.5 text-pink-600">
                <Filter className="h-6 w-6" />
              </span>
              Categorías
            </h2>
            <div className="flex flex-wrap gap-3">
              {CATEGORIAS.map((cat) => (
                <Link
                  key={cat}
                  href={`${ROUTES.CATALOG}?categoria=${cat.toLowerCase()}`}
                  className="inline-block rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition-all hover:border-pink-300 hover:bg-pink-50 hover:text-pink-600"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Tendencias */}
          <div className="flex flex-col gap-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
            <h2 className="flex items-center gap-3 text-2xl font-black text-gray-900">
              <span className="rounded-xl bg-pink-100 p-2.5 text-pink-600">
                <Star className="h-6 w-6 fill-current" />
              </span>
              Tendencias
            </h2>
            <div className="flex flex-wrap gap-3">
              {ETIQUETAS.map((et) => (
                <Link
                  key={et}
                  href={`${ROUTES.CATALOG}?search=${encodeURIComponent(et)}`}
                  className="inline-block rounded-full bg-gray-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-pink-600"
                >
                  #{et}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Productos flash */}
        {flashProducts.length > 0 && (
          <section className="w-full">
            <div className="mb-6 flex items-end justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900 md:text-3xl">
                  <span className="text-yellow-500">⚡</span> Ofertas del momento
                </h2>
                <p className="mt-1 text-sm text-gray-500 md:text-base">
                  Aprovecha antes de que se agoten.
                </p>
              </div>
              <Link
                href={ROUTES.CATALOG}
                className="hidden font-bold text-pink-600 hover:underline sm:inline-block"
              >
                Ver todo →
              </Link>
            </div>

            {/* Contenedor de las cards */}
            <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 md:grid md:snap-none md:grid-cols-4 md:gap-6 md:overflow-visible">
              {flashProducts.slice(0, 4).map((product, i) => (
                <div key={product.id} className="w-[260px] shrink-0 snap-start md:w-auto">
                  <ProductCard product={product} priority={i === 0} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Colecciones */}
        <section className="w-full">
          <div className="mb-6 flex items-end justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 md:text-3xl">Colecciones</h2>
              <p className="mt-1 text-sm text-gray-500 md:text-base">Encuentra tu estilo ideal.</p>
            </div>
            <Link
              href={ROUTES.CATALOG}
              className="hidden font-bold text-pink-600 hover:underline sm:inline-block"
            >
              Explorar →
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COLECCIONES.map((cat) => (
              <Link
                key={cat.nombre}
                href={cat.href}
                className="group relative block h-72 w-full overflow-hidden rounded-3xl bg-gray-200 shadow-sm transition-shadow hover:shadow-lg md:h-80"
              >
                <Image
                  src={cat.img}
                  alt={cat.nombre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6">
                  <h3 className="mb-1 text-2xl font-black text-white">{cat.nombre}</h3>
                  <p className="flex items-center gap-2 text-sm font-bold text-pink-400 opacity-90 transition-opacity group-hover:opacity-100">
                    Ver más <span className="text-lg leading-none">→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link
            href={ROUTES.CATALOG}
            className="mt-6 block rounded-xl bg-gray-900 py-4 text-center font-bold text-white sm:hidden"
          >
            Ver catálogo completo
          </Link>
        </section>

        {/* 6. Cómo funciona */}
        <section className="mb-10 w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-12">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-2xl font-black text-gray-900 md:text-3xl">
              Comprar nunca fue tan fácil
            </h2>
            <p className="text-gray-500">Tres pasos y tu ropa llega donde estás.</p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              {
                step: '1',
                icon: '🛍️',
                title: 'Elegís tu ropa',
                desc: 'Revisá las medidas exactas. Añadí al carrito sin registrarte.',
              },
              {
                step: '2',
                icon: '📝',
                title: 'Llenás tus datos',
                desc: 'Proporcioná tu dirección de envío en Santa Cruz de forma segura.',
              },
              {
                step: '3',
                icon: '📲',
                title: 'Coordinás por WhatsApp',
                desc: 'Generá tu ticket y chateá con nosotros para la entrega.',
              },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-pink-100 bg-pink-50">
                  <span className="text-3xl">{icon}</span>
                  <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-sm font-black text-white shadow-md">
                    {step}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
