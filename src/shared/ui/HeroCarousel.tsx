"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@src/routes';

const SLIDES = [
    {
        id: 1,
        title: "Tu moda, un click de distancia",
        subtitle: "Ropa trendy con tallas exactas, pagos simples y entrega coordinada por WhatsApp.",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop", // Foto de moda
    },
    {
        id: 2,
        title: "Nueva Colección Verano 2026",
        subtitle: "Descubrí los colores de temporada y renová tu guardarropa hoy mismo.",
        image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop", // Foto de verano
    },
    {
        id: 3,
        title: "Ventas Flash ⚡",
        subtitle: "Hasta 50% de descuento en prendas seleccionadas por tiempo limitado.",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop", // Foto de ofertas
    }
];

export function HeroCarousel() {
    const [current, setCurrent] = useState(0);

    // Efecto para cambiar la imagen cada 5 segundos
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative w-full h-[80vh] min-h-[500px] flex items-center justify-center overflow-hidden rounded-2xl mb-16">
            {/* Las imágenes de fondo */}
            {SLIDES.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Capa oscura para que el texto se lea bien */}
                    <div className="absolute inset-0 bg-black/50 z-10" />
                    <Image
                        src={slide.image}
                        alt={slide.title}
                        fill
                        className="object-cover"
                        sizes="100vw"
                        priority={index === 0}
                    />
                </div>
            ))}

            {/* El contenido del Slide actual */}
            <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl mx-auto">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-400 bg-pink-500/20 px-4 py-1.5 text-sm font-medium text-pink-100 backdrop-blur-sm">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-pink-400" />
                    Fast Fashion · Santa Cruz de la Sierra
                </span>

                <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
                    {SLIDES[current].title}
                </h1>

                <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-gray-200 sm:text-xl drop-shadow-md">
                    {SLIDES[current].subtitle}
                </p>

                <div className="flex flex-wrap justify-center gap-4 w-full">
                    <Link
                        href={ROUTES.CATALOG}
                        className="inline-flex h-14 min-w-[280px] items-center justify-center gap-4 rounded-xl bg-pink-600 px-12 text-lg font-bold text-white shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:bg-pink-700"
                    >
                        <span>Explorar catálogo</span>
                        <span className="text-xl transition-transform group-hover:translate-x-2">&rarr;</span>
                    </Link>
                </div>
            </div>

            {/* Botoncitos de navegación abajo (Dots) */}
            <div className="absolute bottom-8 z-20 flex gap-2">
                {SLIDES.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-3 w-10 rounded-full transition-all duration-300 ${index === current ? 'bg-pink-500 w-16' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}