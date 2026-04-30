"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ROUTES } from "@src/routes";

const SLIDES = [
    {
        id: 1,
        title: "Tu moda, un click de distancia",
        subtitle:
            "Ropa trendy con tallas exactas, pagos simples y entrega coordinada por WhatsApp.",
        image:
            "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
    },
    {
        id: 2,
        title: "Nueva Colección Verano 2026",
        subtitle:
            "Descubrí los colores de temporada y renová tu guardarropa hoy mismo.",
        image:
            "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    },
    {
        id: 3,
        title: "Ventas Flash ⚡",
        subtitle:
            "Hasta 50% de descuento en prendas seleccionadas por tiempo limitado.",
        image:
            "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop",
    },
];

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    const goTo = useCallback((index: number) => {
        setCurrent(index);
    }, []);

    // Efecto de autoplay que se reinicia al cambiar manualmente
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [current]); // <- se reinicia al cambiar current

    return (
        <section
            className="relative w-full h-[70vh] max-h-[650px] min-h-[460px] flex items-center justify-center overflow-hidden rounded-2xl"
            role="region"
            aria-roledescription="carousel"
            aria-label="Carrusel de promociones"
        >
            {/* Imágenes de fondo */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                    aria-hidden={index !== current}
                >
                    {/* Overlay con degradado más elegante */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1200px) 100vw, 1200px"
                        priority={index === 0}
                    />
                </div>
            ))}

            {/* Contenido textual */}
            <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400 bg-pink-500/20 px-4 py-1.5 text-sm font-medium text-pink-100 backdrop-blur-sm">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                    Fast Fashion · Santa Cruz de la Sierra
                </span>

                <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
                    {SLIDES[current].title}
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-200 sm:text-xl drop-shadow-md">
                    {SLIDES[current].subtitle}
                </p>

                <div className="flex flex-wrap justify-center gap-4 w-full">
                    <Link
                        href={ROUTES.CATALOG}
                        className="group inline-flex h-14 min-w-[260px] items-center justify-center gap-3 rounded-xl bg-pink-600 px-10 text-lg font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
                    >
                        <span>Explorar catálogo</span>
                        <span className="text-xl transition-transform group-hover:translate-x-1">
                            &rarr;
                        </span>
                    </Link>
                </div>
            </div>

            {/* Dots de navegación */}
            <div className="absolute bottom-6 z-20 flex gap-2" role="tablist">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goTo(index)}
                        role="tab"
                        aria-selected={index === current}
                        aria-label={`Ir a la diapositiva ${index + 1}`}
                        className={`h-3 w-10 rounded-full transition-all duration-300 ${index === current
                                ? "bg-pink-500 w-12 scale-110"
                                : "bg-white/50 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}