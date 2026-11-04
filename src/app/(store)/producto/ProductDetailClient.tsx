'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, MessageCircle, Minus, Plus, Share, Star } from 'lucide-react';
import { ROUTES } from '@src/routes';
import { useCartStore } from '@src/core/store/useCartStore';
import { toast } from '@src/core/store/useToastStore';
import { ProductService } from '@src/services/ProductService';
import { ReviewService } from '@src/services/ReviewService';
import { ReviewList } from '@src/shared/ui/ReviewList';
import { ReviewForm } from '@src/shared/ui/ReviewForm';
import { PageSpinner } from '@src/shared/ui/Spinner';
import { whatsappHref } from '@src/core/config/env.config';
import { colorSwatch, GUIA_CALZADO } from '@src/core/constants/CATALOG';
import type { IProduct, IResena } from '@src/core/models';

export function ProductDetailClient() {
  const slug = useSearchParams().get('slug') ?? '';
  const addItem = useCartStore((s) => s.addItem);
  const galleryRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLDivElement>(null);

  const [product, setProduct] = useState<IProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<IResena[]>([]);
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    void ProductService.getProductBySlug(slug).then(async (found) => {
      setProduct(found);
      setColor(found?.colors[0] ?? null);
      if (found) setReviews(await ReviewService.getReviewsByProduct(found.id));
      setLoading(false);
    });
  }, [slug]);

  if (loading) return <PageSpinner label="Cargando..." />;

  if (!product) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="mb-4 font-semibold text-gray-700">Este producto ya no está disponible</p>
        <Link href={ROUTES.CATALOG} className="font-bold text-pink-600">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const current = product;
  const stockOf = (s: string) =>
    (color ? current.variantStock?.[color]?.[s] : undefined) ?? current.stock[s] ?? 0;
  const available = size ? stockOf(size) : 0;
  const isShoe = current.sizes.every((s) => s in GUIA_CALZADO);
  const hasDiscount = current.originalPrice != null && current.originalPrice > current.price;

  function scrollToImage(index: number) {
    const row = galleryRef.current;
    if (row) row.scrollTo({ left: row.clientWidth * index, behavior: 'smooth' });
  }

  function chooseColor(next: string) {
    setColor(next);
    setQty(1);
    setAdded(false);
    if (size && (current.variantStock?.[next]?.[size] ?? 0) === 0) setSize(null);
    const image = current.colorImage?.[next];
    if (image !== undefined) scrollToImage(image);
  }

  function handleAdd() {
    if (!size) {
      setSizeError(true);
      sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const image = current.images[current.colorImage?.[color ?? ''] ?? 0] ?? current.images[0];
    addItem({
      productId: current.id,
      name: current.name,
      slug: current.slug,
      imageUrl: image?.url ?? '',
      price: current.price,
      quantity: qty,
      selectedSize: size,
      selectedColor: color ?? 'Único',
    });
    setAdded(true);
    toast.success(`${current.name} agregado al carrito`);
  }

  async function handleShare() {
    const url = window.location.href;
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: current.name, text: current.description, url });
      } catch {
        // El usuario cerró la hoja de compartir.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Enlace copiado');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  }

  const waMessage = `Hola! Me interesa "${current.name}"${color ? `, color ${color}` : ''}${
    size ? `, talla ${size}` : ''
  }. ¿Está disponible?`;

  return (
    <div className="page-with-cta mx-auto max-w-5xl md:grid md:grid-cols-2 md:gap-10 md:px-6 md:pt-8">
      {/* Galería deslizable */}
      <div className="relative">
        <div
          ref={galleryRef}
          className="snap-row md:rounded-2xl"
          onScroll={(e) =>
            setActiveImg(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))
          }
        >
          {current.images.map((image, index) => (
            <div key={image.id} className="relative aspect-[4/5] w-full bg-gray-100">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
        </div>

        <Link
          href={ROUTES.CATALOG}
          aria-label="Volver al catálogo"
          className="absolute top-3 left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow"
        >
          <ArrowLeft size={20} />
        </Link>
        <button
          type="button"
          onClick={handleShare}
          aria-label="Compartir producto"
          className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow"
        >
          <Share size={19} />
        </button>
        {current.images.length > 1 && (
          <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
            {activeImg + 1}/{current.images.length}
          </span>
        )}
      </div>

      <div className="space-y-5 px-4 pt-4 md:px-0 md:pt-0">
        <div>
          <h1 className="text-2xl leading-tight font-black text-gray-900">{current.name}</h1>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">Bs. {current.price}</span>
            {hasDiscount && (
              <span className="text-base text-gray-400 line-through">
                Bs. {current.originalPrice}
              </span>
            )}
          </div>
          {current.rating != null && (
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              {current.rating} · {current.reviewCount} opiniones
            </p>
          )}
        </div>

        {/* Color */}
        {current.colors.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-bold text-gray-900">
              Color: <span className="font-medium text-gray-600">{color}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {current.colors.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`Color ${name}`}
                  aria-pressed={color === name}
                  onClick={() => chooseColor(name)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                    color === name ? 'border-gray-900' : 'border-transparent'
                  }`}
                >
                  <span
                    className="h-8 w-8 rounded-full border border-black/15"
                    style={{ background: colorSwatch(name) }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Talla */}
        <div ref={sizesRef}>
          <p className={`mb-2 text-sm font-bold ${sizeError ? 'text-red-600' : 'text-gray-900'}`}>
            {sizeError && !size ? 'Elegí tu talla para continuar' : 'Talla'}
            {size && <span className="font-medium text-gray-600">: {size}</span>}
          </p>
          <div className="grid grid-cols-5 gap-2">
            {current.sizes.map((s) => {
              const stock = stockOf(s);
              const selected = size === s;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={stock === 0}
                  aria-pressed={selected}
                  aria-label={stock === 0 ? `Talla ${s}, agotada` : `Talla ${s}`}
                  onClick={() => {
                    setSize(s);
                    setQty(1);
                    setSizeError(false);
                    setAdded(false);
                  }}
                  className={`h-12 rounded-xl border text-sm font-bold ${
                    selected
                      ? 'border-gray-900 bg-gray-900 text-white'
                      : stock === 0
                        ? 'border-gray-100 bg-gray-50 text-gray-300 line-through'
                        : 'border-gray-300 bg-white text-gray-800'
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          {size && available > 0 && available <= 3 && (
            <p className="mt-2 text-sm font-semibold text-amber-700">
              Solo {available === 1 ? 'queda 1' : `quedan ${available}`} en esta talla
            </p>
          )}
        </div>

        {/* Cantidad */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-gray-900">Cantidad</p>
          <div className="flex items-center rounded-xl border border-gray-200 bg-white">
            <button
              type="button"
              aria-label="Reducir cantidad"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center text-gray-700"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-bold" aria-live="polite">
              {qty}
            </span>
            <button
              type="button"
              aria-label="Aumentar cantidad"
              disabled={!size || qty >= available}
              onClick={() => setQty((q) => q + 1)}
              className="flex h-11 w-11 items-center justify-center text-gray-700 disabled:text-gray-300"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Información plegable */}
        <div className="divide-y divide-gray-200 border-y border-gray-200">
          <details className="group" open>
            <summary className="flex h-12 cursor-pointer list-none items-center justify-between text-sm font-bold text-gray-900">
              Descripción
              <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
            </summary>
            <div className="pb-3 text-sm text-gray-600">
              <p>{current.description}</p>
              {current.tipo_tela && (
                <p className="mt-2">
                  <strong className="text-gray-800">Material:</strong> {current.tipo_tela}
                </p>
              )}
            </div>
          </details>

          {(isShoe || Object.keys(current.medidas_dinamicas).length > 0) && (
            <details className="group">
              <summary className="flex h-12 cursor-pointer list-none items-center justify-between text-sm font-bold text-gray-900">
                Guía de tallas
                <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
              </summary>
              <div className="pb-3 text-sm text-gray-600">
                {isShoe ? (
                  <>
                    <p className="mb-2">
                      Medí tu pie del talón al dedo más largo y compará con la tabla. Si estás entre
                      dos tallas, elegí la mayor.
                    </p>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-gray-800">
                          <th className="py-1 font-semibold">Talla</th>
                          <th className="py-1 font-semibold">Largo del pie</th>
                        </tr>
                      </thead>
                      <tbody>
                        {current.sizes.map((s) => (
                          <tr key={s} className={size === s ? 'font-bold text-gray-900' : ''}>
                            <td className="py-1">{s}</td>
                            <td className="py-1">{GUIA_CALZADO[s]} cm</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <ul className="space-y-1">
                    {Object.entries(current.medidas_dinamicas).map(([key, value]) => (
                      <li key={key}>
                        <strong className="text-gray-800">{key}:</strong> {String(value)}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          )}

          <details className="group">
            <summary className="flex h-12 cursor-pointer list-none items-center justify-between text-sm font-bold text-gray-900">
              Pago, envío y cambios
              <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-3 text-sm text-gray-600">
              El pago y la entrega se coordinan por WhatsApp, y el envío se paga según tu zona. Si
              la talla no te queda, escribinos para gestionar el cambio.
            </p>
          </details>
        </div>

        <a
          href={whatsappHref(waMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white text-sm font-bold text-gray-800"
        >
          <MessageCircle size={18} className="text-green-600" />
          Consultar por WhatsApp
        </a>

        {/* Reseñas */}
        <section>
          <h2 className="mb-3 text-lg font-black text-gray-900">Opiniones ({reviews.length})</h2>
          <ReviewList reviews={reviews} />
          <div className="mt-4">
            <ReviewForm
              productId={current.id}
              onSuccess={(review) => setReviews((prev) => [...prev, review])}
            />
          </div>
        </section>
      </div>

      {/* Barra de compra */}
      <div className="safe-bottom-3 fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 pt-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="shrink-0">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg leading-tight font-black text-gray-900">
              Bs. {current.price * qty}
            </p>
          </div>
          {added ? (
            <Link
              href={ROUTES.CART}
              className="flex h-12 flex-1 items-center justify-center rounded-xl bg-pink-600 font-bold text-white"
            >
              Ver carrito
            </Link>
          ) : (
            <button
              type="button"
              onClick={handleAdd}
              className="h-12 flex-1 rounded-xl bg-gray-900 font-bold text-white active:bg-black"
            >
              Agregar al carrito
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
