import Link from 'next/link';
import { Clock } from 'lucide-react';
import { FlashSaleTimer } from '@src/shared/ui/FlashSaleTimer';
import { ROUTES } from '@src/routes';
import type { IProduct } from '@src/core/models';

interface FlashSaleBannerProps {
  products: IProduct[];
}

export function FlashSaleBanner({ products }: FlashSaleBannerProps) {
  // Tomamos el primer producto para obtener la fecha de finalización
  const endsAt = products[0]?.flashSaleEndsAt;

  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white shadow-xl md:p-10">
      <div className="relative z-10 flex flex-col items-start justify-between lg:flex-row lg:items-center">
        {/* Contenido izquierdo */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* Badge */}
          <div className="m-4 flex items-center rounded-full bg-white/20 px-4 py-2 text-xs font-bold tracking-widest uppercase backdrop-blur-sm md:text-sm">
            <Clock className="h-4 w-4 animate-pulse" />
            Ventas Flash Online
          </div>

          <h2 className="m-1 ml-4 text-4xl font-black drop-shadow-md md:text-5xl">
            Colección Verano
          </h2>

          {endsAt && (
            <div className="m-1 ml-4 flex w-full flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:w-auto sm:flex-row sm:items-center">
              <span className="text-sm font-medium md:text-base">Oferta termina en:</span>
              <div className="font-mono text-lg font-bold">
                <FlashSaleTimer endsAt={endsAt} variant="inline" />
              </div>
            </div>
          )}

          <Link
            href={ROUTES.CATALOG}
            className="m-1 mb-4 ml-4 inline-flex w-full items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-black text-pink-600 shadow-lg transition-all hover:scale-105 hover:bg-pink-50 sm:w-auto md:text-base"
          >
            APROVECHAR OFERTAS
          </Link>
        </div>
      </div>

      {/* Ícono decorativo de fondo */}
      <Clock className="pointer-events-none absolute -right-10 -bottom-10 hidden h-64 w-64 text-white opacity-10 md:block" />
    </section>
  );
}
