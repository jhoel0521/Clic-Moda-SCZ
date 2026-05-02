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

export function ProductDetailClient({ product, reviews: initialReviews }: ProductDetailClientProps) {
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
  const canAdd = selectedSize !== null && (product.colors.length === 0 || selectedColor !== null);

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
    `Hola! Me interesa "${product.name}"${selectedSize ? `, talla ${selectedSize}` : ''}. ¿Está disponible?`,
  );

  const medidasEntries = Object.entries(product.medidas_dinamicas);

  return (
    <div className="bg-gray-50 pb-24 md:pb-0 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">

        {/* Back link (desktop) */}
        <Link
          href={ROUTES.CATALOG}
          className="hidden md:inline-flex items-center gap-2 text-gray-500 hover:text-pink-600 mb-8 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al catálogo
        </Link>

        {/* Main layout */}
        <div className="flex flex-col md:flex-row gap-8 lg:gap-16">

          {/* LEFT — Image gallery */}
          <div className="w-full md:w-1/2">
            <div className="aspect-[4/5] md:aspect-auto md:h-[600px] w-full bg-gray-100 rounded-3xl overflow-hidden relative shadow-md">
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
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-8xl">👗</div>
              )}

              {/* Gallery dots */}
              {product.images.length > 1 && (
                <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2.5">
                  {product.images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className={`rounded-full shadow-lg border border-gray-200 transition-all ${
                        idx === activeImg
                          ? 'w-7 h-2.5 bg-pink-500'
                          : 'w-2.5 h-2.5 bg-white/80 hover:bg-white'
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
                    className={`relative shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === activeImg ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Product info */}
          <div className="w-full md:w-1/2 flex flex-col">

            {/* Category */}
            <p className="text-pink-600 font-bold tracking-widest text-sm uppercase mb-2">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-tight text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price + stock */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl md:text-4xl font-black text-pink-600">
                Bs. {product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl line-through text-gray-400">
                  Bs. {product.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1.5 rounded-lg">
                Stock: {product.stock}
              </span>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>
            )}

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex justify-between items-end mb-3">
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
                    onClick={() => setSelectedSize(t)}
                    className={`w-14 h-14 md:w-16 md:h-16 rounded-xl border-2 font-bold text-base flex items-center justify-center transition-all ${
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
                <p className="font-bold text-gray-800 mb-3">
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
            <div className="flex items-center gap-4 mb-6">
              <p className="font-bold text-gray-800">Cantidad:</p>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-gray-100 rounded-l-xl transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 font-bold text-base w-10 text-center">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="p-2.5 hover:bg-gray-100 rounded-r-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-400">{product.stock} disponibles</span>
            </div>

            {/* Measurements table */}
            {medidasEntries.length > 0 && (
              <div className="bg-pink-50/60 border border-pink-100 p-5 rounded-2xl mb-6">
                <p className="font-bold text-pink-800 flex items-center gap-2 mb-4">
                  📏 Medidas Exactas (en plano)
                </p>
                <ul className="grid grid-cols-2 gap-2.5 text-sm text-gray-700">
                  {medidasEntries.map(([key, val]) => (
                    <li key={key} className="flex justify-between items-center bg-white px-4 py-2.5 rounded-lg shadow-sm">
                      <span className="font-bold text-gray-800">{key}:</span>
                      <span className="text-gray-600">{String(val)}</span>
                    </li>
                  ))}
                </ul>
                {product.tipo_tela && (
                  <div className="mt-4 pt-4 border-t border-pink-100 flex items-center gap-2">
                    <span className="text-lg">🧵</span>
                    <p className="text-gray-700 text-sm">
                      Material: <span className="font-bold">{product.tipo_tela}</span>
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CTA desktop */}
            <div className="hidden md:flex flex-col gap-3">
              <button
                type="button"
                disabled={!canAdd}
                onClick={handleAdd}
                className="w-full bg-gray-900 hover:bg-pink-600 text-white font-black py-4 rounded-xl text-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-xl"
              >
                {canAdd ? `AÑADIR AL CARRITO (${qty})` : 'SELECCIONA UNA TALLA'}
              </button>
              <a
                href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white hover:border-green-500 hover:bg-green-50 text-gray-700 font-bold py-3 rounded-xl transition-colors"
              >
                <MessageCircle size={18} className="text-green-600" />
                Consultar por WhatsApp
              </a>
            </div>

            {/* Reviews (inline on desktop) */}
            <div className="mt-8">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2 text-gray-900">
                Reseñas de Clientes{' '}
                <span className="text-sm bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-medium">
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
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          disabled={!canAdd}
          onClick={handleAdd}
          className="w-full bg-gray-900 hover:bg-pink-600 text-white font-black py-4 rounded-xl disabled:bg-gray-300 transition-colors active:scale-95"
        >
          {canAdd ? `AÑADIR AL CARRITO` : 'SELECCIONA UNA TALLA'}
        </button>
      </div>
    </div>
  );
}
