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
        <section className="w-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between">
                {/* Contenido izquierdo */}
                <div className="flex flex-col items-start gap-4 w-full">
                    {/* Badge */}
                    <div className="flex items-center m-4 font-bold uppercase tracking-widest text-xs md:text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                        <Clock className="w-4 h-4 animate-pulse" />
                        Ventas Flash Online
                    </div>

                    <h2 className="text-4xl md:text-5xl m-1 ml-4 font-black drop-shadow-md">
                        Colección Verano
                    </h2>

                    {endsAt && (
                        <div className="flex flex-col m-1 ml-4 sm:flex-row sm:items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/10 w-full sm:w-auto">
                            <span className="font-medium text-sm md:text-base">
                                Oferta termina en:
                            </span>
                            <div className="font-mono font-bold text-lg">
                                <FlashSaleTimer endsAt={endsAt} variant="inline" />
                            </div>
                        </div>
                    )}

                    <Link
                        href={ROUTES.CATALOG}
                        className="m-1 ml-4 mb-4 inline-flex items-center justify-center bg-white text-pink-600 font-black px-8 py-4 rounded-full text-sm md:text-base shadow-lg hover:bg-pink-50 hover:scale-105 transition-all w-full sm:w-auto"
                    >
                        APROVECHAR OFERTAS
                    </Link>
                </div>
            </div>

            {/* Ícono decorativo de fondo */}
            <Clock className="absolute -right-10 -bottom-10 w-64 h-64 text-white opacity-10 pointer-events-none hidden md:block" />
        </section>
    );
}