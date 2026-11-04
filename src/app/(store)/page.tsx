'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Ruler, Truck } from 'lucide-react';
import { ROUTES } from '@src/routes';
import { CATEGORIAS } from '@src/core/constants/CATALOG';
import { whatsappHref } from '@src/core/config/env.config';
import { HeroCarousel } from '@src/shared/ui/HeroCarousel';
import { ProductCard } from '@src/shared/ui/ProductCard';
import { FlashSaleBanner } from '@src/shared/ui/FlashSaleBanner';
import { ProductService } from '@src/services/ProductService';
import { BannerService } from '@src/services/BannerService';
import type { IBannerPromocional, IProduct } from '@src/core/models';
import seed from '../../../data/db.json';

const seedProducts = seed.products as unknown as IProduct[];
const seedBanners = seed.banners as IBannerPromocional[];

const BENEFICIOS = [
  { icon: Ruler, title: 'Talla exacta', text: 'Guía con el largo del pie en cm.' },
  {
    icon: MessageCircle,
    title: 'Pedido por WhatsApp',
    text: 'Confirmás y pagás directo por el chat.',
  },
  { icon: Truck, title: 'Entrega coordinada', text: 'Acordamos el envío según tu zona.' },
];

export default function LandingPage() {
  const [products, setProducts] = useState<IProduct[]>(seedProducts);
  const [banners, setBanners] = useState<IBannerPromocional[]>(seedBanners);

  useEffect(() => {
    void ProductService.getProducts().then((all) =>
      setProducts(all.filter((p) => p.estado === 'activo'))
    );
    void BannerService.getActiveBanners().then(setBanners);
  }, []);

  const flash = products.filter((p) => p.isFlashSale);
  const calzado = products.filter((p) =>
    CATEGORIAS.some((c) => c.id === p.category && c.grupo === 'calzado')
  );
  const ropa = products.filter((p) =>
    CATEGORIAS.some((c) => c.id === p.category && c.grupo === 'ropa')
  );
  const categoriaFoto = (id: string) =>
    products.find((p) => p.category === id)?.images[0]?.url ?? '';

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-7 md:gap-12 md:px-6 md:pt-6">
      <HeroCarousel banners={banners} />

      {/* Categorías */}
      <section aria-label="Categorías">
        <div className="snap-row gap-3 px-4 md:px-0">
          {CATEGORIAS.map((cat) => (
            <Link
              key={cat.id}
              href={`${ROUTES.CATALOG}?categoria=${cat.id}`}
              className="flex w-[72px] flex-col items-center gap-1.5"
            >
              <span className="relative h-[68px] w-[68px] overflow-hidden rounded-full bg-gray-200">
                {categoriaFoto(cat.id) && (
                  <Image
                    src={categoriaFoto(cat.id)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="68px"
                  />
                )}
              </span>
              <span className="text-xs font-semibold text-gray-800">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Ofertas */}
      {flash.length > 0 && (
        <section className="space-y-3">
          <div className="px-4 md:px-0">
            <FlashSaleBanner products={flash} />
          </div>
          <div className="snap-row gap-3 px-4 md:px-0">
            {flash.map((product) => (
              <div key={product.id} className="w-[44vw] max-w-[230px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Calzado */}
      <section className="px-4 md:px-0">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-xl font-black text-gray-900">Zapatos</h2>
          <Link href={ROUTES.CATALOG} className="py-2 text-sm font-bold text-pink-600">
            Ver todos
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {calzado.slice(0, 6).map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* Ropa */}
      {ropa.length > 0 && (
        <section>
          <h2 className="mb-3 px-4 text-xl font-black text-gray-900 md:px-0">Ropa para combinar</h2>
          <div className="snap-row gap-3 px-4 md:px-0">
            {ropa.map((product) => (
              <div key={product.id} className="w-[44vw] max-w-[230px]">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Beneficios */}
      <section className="mx-4 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white md:mx-0">
        {BENEFICIOS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-center gap-3 p-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-600">
              <Icon size={20} />
            </span>
            <span>
              <span className="block text-sm font-bold text-gray-900">{title}</span>
              <span className="block text-xs text-gray-500">{text}</span>
            </span>
          </div>
        ))}
      </section>

      <div className="px-4 md:px-0">
        <a
          href={whatsappHref('Hola! Quiero consultar por un par de zapatos.')}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#25D366] font-bold text-white active:opacity-80"
        >
          <MessageCircle size={20} />
          Consultar por WhatsApp
        </a>
        <p className="mt-5 flex justify-center gap-5 text-sm font-medium text-gray-500">
          <Link href={ROUTES.ABOUT} className="py-2">
            Nosotros
          </Link>
          <Link href={ROUTES.CONTACT} className="py-2">
            Contacto
          </Link>
        </p>
      </div>
    </div>
  );
}
