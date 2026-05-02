'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@src/routes';
import type { IBannerPromocional } from '@src/core/models';

interface HeroCarouselProps {
  banners: IBannerPromocional[];
}

export function HeroCarousel({ banners }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index: number) => {
    setCurrent(index);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [current, banners.length]);

  if (banners.length === 0) return null;

  const slide = banners[current];

  return (
    <section
      className="relative flex h-[70vh] max-h-[650px] min-h-[460px] w-full items-center justify-center overflow-hidden rounded-2xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Carrusel de promociones"
    >
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 h-full w-full transition-opacity duration-1000 ease-in-out ${
            index === current ? 'z-10 opacity-100' : 'z-0 opacity-0'
          }`}
          aria-hidden={index !== current}
        >
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
          <Image
            src={banner.url_pc}
            alt={banner.titulo}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
            priority={index === 0}
          />
        </div>
      ))}

      <div className="relative z-20 mx-auto flex max-w-4xl flex-col items-center px-6 text-center">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400 bg-pink-500/20 px-4 py-1.5 text-sm font-medium text-pink-100 backdrop-blur-sm">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-pink-400" />
          Fast Fashion · Santa Cruz de la Sierra
        </span>

        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
          {slide.titulo}
        </h1>

        {slide.descripcion && (
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-200 drop-shadow-md sm:text-xl">
            {slide.descripcion}
          </p>
        )}

        <div className="flex w-full flex-wrap justify-center gap-4">
          <Link
            href={ROUTES.CATALOG}
            className="group inline-flex h-14 min-w-[260px] items-center justify-center gap-3 rounded-xl bg-pink-600 px-10 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          >
            <span>Explorar catálogo</span>
            <span className="text-xl transition-transform group-hover:translate-x-1">&rarr;</span>
          </Link>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-6 z-20 flex gap-2" role="tablist">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              role="tab"
              aria-selected={index === current}
              aria-label={`Ir a la diapositiva ${index + 1}`}
              className={`h-3 w-10 rounded-full transition-all duration-300 ${
                index === current ? 'w-12 scale-110 bg-pink-500' : 'bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
