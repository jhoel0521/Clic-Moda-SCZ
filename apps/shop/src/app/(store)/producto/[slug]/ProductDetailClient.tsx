'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Minus, Plus, MessageCircle } from 'lucide-react';
import { ROUTES } from '@src/routes';
import { useCartStore } from '@src/core/store/useCartStore';
import { toast } from '@src/core/store/useToastStore';
import { ReviewList } from '@src/shared/ui/ReviewList';
import { ReviewForm } from '@src/shared/ui/ReviewForm';
import type { IProduct, IResena, Talla } from '@src/core/models';

const WA_NUMBER = '59177000001';

interface ProductDetailClientProps {
  product: IProduct;
  reviews: IResena[];
}

export function ProductDetailClient({
  product,
  reviews: initialReviews,
}: ProductDetailClientProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [reviews, setReviews] = useState<IResena[]>(initialReviews);
  const [selectedSize, setSelectedSize] = useState<Talla | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(() => {
    const idx = product.images.findIndex((i) => i.isPrimary);
    return idx >= 0 ? idx : 0;
  });

  const primaryImage = product.images[activeImg] ?? product.images[0];
  const availableStock = selectedSize ? (product.stock[selectedSize] ?? 0) : 0;
  const canAdd =
    selectedSize !== null &&
    (product.colors.length === 0 || selectedColor !== null) &&
    availableStock > 0;

  function handleAdd() {
    if (!canAdd) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: primaryImage?.url ?? '',
      price: product.price,
      quantity: qty,
      selectedSize: selectedSize!,
      selectedColor: selectedColor ?? 'Único',
    });
    toast.success(`¡${product.name} agregado al carrito!`);
  }

  const waMsg = encodeURIComponent(
    `Hola! Me interesa "${product.name}"${selectedSize ? `, talla ${selectedSize}` : ''}. ¿Está disponible?`
  );

  const medidasEntries = Object.entries(product.medidas_dinamicas);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-12">
        {/* Back link (desktop) */}
        <Link
          href={ROUTES.CATALOG}
          className="mb-8 hidden items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-pink-600 md:inline-flex"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        {/* Main layout */}
        <div className="flex flex-col gap-8 md:flex-row lg:gap-16">
          {/* LEFT — Image gallery */}
          <div className="w-full md:w-1/2">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl bg-gray-100 shadow-md md:aspect-auto md:h-[600px]">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl text-gray-300">
                  👗
                </div>
              )}

              {/* Gallery dots */}
              {product.images.length > 1 && (
                <div className="absolute right-0 bottom-5 left-0 flex justify-center gap-2.5">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className={`rounded-full border border-gray-200 shadow-lg transition-all ${
                        idx === activeImg
                          ? 'h-2.5 w-7 bg-pink-500'
                          : 'h-2.5 w-2.5 bg-white/80 hover:bg-white'
                      }`}
                      aria-label={`Imagen ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:h-20 md:w-20 ${
                      idx === activeImg
                        ? 'border-gray-900'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product info */}
          <div className="flex w-full flex-col md:w-1/2">
            {/* Category */}
            <p className="mb-2 text-sm font-bold tracking-widest text-pink-600 uppercase">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="mb-4 text-3xl leading-tight font-black text-gray-900 md:text-4xl lg:text-5xl">
              {product.name}
            </h1>

            {/* Price + stock */}
            <div className="mb-4 flex items-center gap-4">
              <span className="text-3xl font-black text-pink-600 md:text-4xl">
                Bs. {product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  Bs. {product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="rounded-lg bg-green-100 px-3 py-1.5 text-sm font-bold text-green-800">
                {selectedSize
                  ? `Stock talla ${selectedSize}: ${availableStock}`
                  : 'Selecciona una talla para ver stock'}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="mb-6 text-sm leading-relaxed text-gray-600">{product.description}</p>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <div className="mb-3 flex items-end justify-between">
                <p className="font-bold text-gray-800">
                  Selecciona tu Talla:
                  {selectedSize && <span className="ml-2 text-pink-600">{selectedSize}</span>}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => {
                      setSelectedSize(t);
                      setQty(1);
                    }}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border-2 text-base font-bold transition-all md:h-16 md:w-16 ${
                      selectedSize === t
                        ? 'border-gray-900 bg-gray-900 text-white shadow-md'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Color selector */}
            {product.colors.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 font-bold text-gray-800">
                  Color:
                  {selectedColor && <span className="ml-2 text-pink-600">{selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-xl border-2 px-4 py-2 text-sm font-bold transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="mb-6 flex items-center gap-4">
              <p className="font-bold text-gray-800">Cantidad:</p>
              <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="rounded-l-xl p-2.5 transition-colors hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 px-4 text-center text-base font-bold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(availableStock || 1, q + 1))}
                  disabled={!selectedSize || availableStock === 0}
                  className="rounded-r-xl p-2.5 transition-colors hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">
                {selectedSize
                  ? availableStock > 0
                    ? `${availableStock} disponibles en talla ${selectedSize}`
                    : `Sin stock en talla ${selectedSize}`
                  : 'Selecciona una talla para ver stock'}
              </span>
            </div>

            {/* Measurements table */}
            {medidasEntries.length > 0 && (
              <div className="mb-6 rounded-2xl border border-pink-100 bg-pink-50/60 p-5">
                <p className="mb-4 flex items-center gap-2 font-bold text-pink-800">
                  📏 Medidas Exactas (en plano)
                </p>
                <ul className="grid grid-cols-2 gap-2.5 text-sm text-gray-700">
                  {medidasEntries.map(([key, val]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between rounded-lg bg-white px-4 py-2.5 shadow-sm"
                    >
                      <span className="font-bold text-gray-800">{key}:</span>
                      <span className="text-gray-600">{String(val)}</span>
                    </li>
                  ))}
                </ul>
                {product.tipo_tela && (
                  <div className="mt-4 flex items-center gap-2 border-t border-pink-100 pt-4">
                    <span className="text-lg">🧵</span>
                    <p className="text-sm text-gray-700">
                      Material: <span className="font-bold">{product.tipo_tela}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTA desktop */}
            <div className="hidden flex-col gap-3 md:flex">
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAdd}
                className="w-full rounded-xl bg-gray-900 py-4 text-lg font-black text-white shadow-xl transition-colors hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {canAdd ? `AÑADIR AL CARRITO (${qty})` : 'SELECCIONA UNA TALLA'}
              </button>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 font-bold text-gray-700 transition-colors hover:border-green-500 hover:bg-green-50"
              >
                <MessageCircle size={18} className="text-green-600" />
                Consultar por WhatsApp
              </a>
            </div>

            {/* Reviews (inline on desktop) */}
            <div className="mt-8">
              <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
                Reseñas de Clientes{' '}
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-sm font-medium text-gray-600">
                  {reviews.length}
                </span>
              </h3>
              <ReviewList reviews={reviews} />
            </div>
          </div>
        </div>

        {/* Review form */}
        <div className="mt-12 max-w-2xl">
          <ReviewForm
            productId={product.id}
            onSuccess={(r) => setReviews((prev) => [...prev, r])}
          />
        </div>
      </div>

      {/* FLOATING CTA — mobile only */}
      <div className="fixed right-0 bottom-16 left-0 z-40 border-t border-gray-200 bg-white p-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:hidden">
        <button
          type="button"
          disabled={!canAdd}
          onClick={handleAdd}
          className="w-full rounded-xl bg-gray-900 py-4 font-black text-white transition-colors hover:bg-pink-600 active:scale-95 disabled:bg-gray-300"
        >
          {canAdd ? `AÑADIR AL CARRITO` : 'SELECCIONA UNA TALLA'}
        </button>
      </div>
    </div>
  );
}
