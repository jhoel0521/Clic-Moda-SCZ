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
    <div className="w-full bg-gray-50 gap-8 flex flex-col justify-start items-center">
      {/* ++++++++++++++++++ HERO CENTRADO ++++++++++++++++++ */}
      <div className="w-full max-w-[1200px] mx-auto mt-6 md:mt-8 mt-4">
        <HeroCarousel />
      </div>

      {/* ++++++++++++++++++ CONTENIDO PRINCIPAL ++++++++++++++++++ */}
      <main className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 md:mt-12 flex flex-col gap-12 md:gap-20">

        {/* 2. Banner ventas flash */}
        {flashProducts.length > 0 && <FlashSaleBanner products={flashProducts} />}

        {/* 3. Categorías + Tendencias (Grid 2 columnas) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full">

          {/* Categorías */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="font-black text-2xl flex items-center gap-3 text-gray-900">
              <span className="bg-pink-100 p-2.5 rounded-xl text-pink-600">
                <Filter className="w-6 h-6" />
              </span>
              Categorías
            </h2>
            <div className="flex flex-wrap gap-3">
              {CATEGORIAS.map((cat) => (
                <Link
                  key={cat}
                  href={`${ROUTES.CATALOG}?categoria=${cat.toLowerCase()}`}
                  className="inline-block bg-gray-50 border border-gray-200 text-gray-700 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Tendencias */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
            <h2 className="font-black text-2xl flex items-center gap-3 text-gray-900">
              <span className="bg-pink-100 p-2.5 rounded-xl text-pink-600">
                <Star className="w-6 h-6 fill-current" />
              </span>
              Tendencias
            </h2>
            <div className="flex flex-wrap gap-3">
              {ETIQUETAS.map((et) => (
                <Link
                  key={et}
                  href={`${ROUTES.CATALOG}?search=${encodeURIComponent(et)}`}
                  className="inline-block bg-gray-900 text-white hover:bg-pink-600 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md hover:-translate-y-0.5"
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
            <div className="flex items-end justify-between mb-6 border-b border-gray-200 pb-4">
              <div>
                <h2 className="font-black text-2xl md:text-3xl text-gray-900 flex items-center gap-2">
                  <span className="text-yellow-500">⚡</span> Ofertas del momento
                </h2>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Aprovecha antes de que se agoten.</p>
              </div>
              <Link href={ROUTES.CATALOG} className="hidden sm:inline-block text-pink-600 font-bold hover:underline">
                Ver todo →
              </Link>
            </div>

            {/* Contenedor de las cards */}
            <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible md:snap-none scrollbar-hide">
              {flashProducts.slice(0, 4).map((product, i) => (
                <div key={product.id} className="snap-start shrink-0 w-[260px] md:w-auto">
                  <ProductCard product={product} priority={i === 0} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. Colecciones */}
        <section className="w-full">
          <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
            <div>
              <h2 className="font-black text-2xl md:text-3xl text-gray-900">Colecciones</h2>
              <p className="mt-1 text-gray-500 text-sm md:text-base">Encuentra tu estilo ideal.</p>
            </div>
            <Link href={ROUTES.CATALOG} className="hidden sm:inline-block text-pink-600 font-bold hover:underline">
              Explorar →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {COLECCIONES.map((cat) => (
              <Link
                key={cat.nombre}
                href={cat.href}
                className="group relative h-72 md:h-80 w-full overflow-hidden rounded-3xl bg-gray-200 block shadow-sm hover:shadow-lg transition-shadow"
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
                  <h3 className="text-2xl font-black text-white mb-1">{cat.nombre}</h3>
                  <p className="text-sm font-bold text-pink-400 flex items-center gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    Ver más <span className="text-lg leading-none">→</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <Link href={ROUTES.CATALOG} className="mt-6 block sm:hidden text-center bg-gray-900 text-white font-bold py-4 rounded-xl">
            Ver catálogo completo
          </Link>
        </section>

        {/* 6. Cómo funciona */}
        <section className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 mb-10">
          <div className="text-center mb-10">
            <h2 className="font-black text-2xl md:text-3xl text-gray-900 mb-2">Comprar nunca fue tan fácil</h2>
            <p className="text-gray-500">Tres pasos y tu ropa llega donde estás.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '1', icon: '🛍️', title: 'Elegís tu ropa', desc: 'Revisá las medidas exactas. Añadí al carrito sin registrarte.' },
              { step: '2', icon: '📝', title: 'Llenás tus datos', desc: 'Proporcioná tu dirección de envío en Santa Cruz de forma segura.' },
              { step: '3', icon: '📲', title: 'Coordinás por WhatsApp', desc: 'Generá tu ticket y chateá con nosotros para la entrega.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative w-20 h-20 rounded-full bg-pink-50 flex items-center justify-center mb-5 border border-pink-100">
                  <span className="text-3xl">{icon}</span>
                  <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gray-900 text-sm font-black text-white flex items-center justify-center shadow-md">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}