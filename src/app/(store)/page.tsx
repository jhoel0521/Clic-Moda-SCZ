import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@src/routes';
import { HeroCarousel } from '@src/shared/ui/HeroCarousel';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { FlashSaleTimer } from '@src/shared/ui/FlashSaleTimer';
import { Section } from '@src/shared/ui/layout/Section';
import { Container } from '@src/shared/ui/layout/Container';
import { ProductService } from '@src/services/ProductService';

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
  const flashProducts = await ProductService.getFlashSaleProducts();

  return (
    <>
      {/* 1. Carrusel */}
      <HeroCarousel />

      {/* 2. Ventas Flash */}
      {flashProducts.length > 0 && (
        <Section size="md" className="bg-[var(--color-bg-secondary)]">
          <Container>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
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
          </Container>
        </Section>
      )}

      {/* 3. Colecciones */}
      <Section size="lg" className="bg-white">
        <Container>
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
                <Image
                  src={cat.img}
                  alt={cat.nombre}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 640px) 33vw, 100vw"
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
        </Container>
      </Section>

      {/* 4. ¿Cómo Funciona? */}
      <Section size="lg" className="bg-gray-50">
        <Container size="md">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 sm:text-4xl">Comprar nunca fue tan fácil</h2>
            <p className="mt-3 text-gray-500">Tres pasos y tu ropa llega donde estás.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '1', icon: '🛍️', title: 'Elige tu ropa', desc: 'Revisá las medidas exactas en centímetros. Añadí al carrito sin necesidad de registrarte.' },
              { step: '2', icon: '📝', title: 'Llenás tus datos', desc: 'Proporcioná tu dirección de envío en Santa Cruz de forma rápida y segura.' },
              { step: '3', icon: '📲', title: 'Coordinás por WhatsApp', desc: 'Generá tu ticket y chateá directamente con nosotros para coordinar el pago y la entrega.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="relative w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-6">
                  <span className="text-2xl">{icon}</span>
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-pink-600 text-[10px] font-black text-white">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
