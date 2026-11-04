'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@src/routes';
import type { IBannerPromocional } from '@src/core/models';

interface HeroCarouselProps {
  banners: IBannerPromocional[];
}

/** Carrusel deslizable con el dedo: usa scroll nativo, el más fluido en Safari. */
export function HeroCarousel({ banners }: HeroCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  if (banners.length === 0) return null;

  function handleScroll() {
    const row = rowRef.current;
    if (row) setCurrent(Math.round(row.scrollLeft / row.clientWidth));
  }

  return (
    <section className="relative w-full md:overflow-hidden md:rounded-2xl" aria-label="Promociones">
      <div ref={rowRef} onScroll={handleScroll} className="snap-row">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className="relative aspect-[4/5] max-h-[68dvh] w-full md:aspect-[21/9]"
          >
            <Image
              src={banner.url_movil}
              alt={banner.titulo}
              fill
              className="object-cover md:hidden"
              sizes="100vw"
              priority={index === 0}
            />
            <Image
              src={banner.url_pc}
              alt=""
              fill
              className="hidden object-cover md:block"
              sizes="1200px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 px-5 pb-10 text-white md:px-10">
              <h1 className="text-[32px] leading-tight font-black md:text-5xl">{banner.titulo}</h1>
              {banner.descripcion && (
                <p className="mt-1 mb-4 max-w-lg text-sm text-white/90 md:text-base">
                  {banner.descripcion}
                </p>
              )}
              <Link
                href={ROUTES.CATALOG}
                className="inline-flex h-12 items-center rounded-full bg-white px-6 text-sm font-bold text-gray-900 active:bg-gray-200"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden>
          {banners.map((banner, index) => (
            <span
              key={banner.id}
              className={`h-1.5 rounded-full transition-all ${
                index === current ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
