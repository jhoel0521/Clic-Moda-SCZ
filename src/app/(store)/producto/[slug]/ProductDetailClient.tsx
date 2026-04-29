'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@src/routes';
import { DynamicMeasurementsTable } from '@src/shared/ui/DynamicMeasurementsTable';
import { ReviewList } from '@src/shared/ui/ReviewList';
import { ReviewForm } from '@src/shared/ui/ReviewForm';
import { ProductImageGallery } from './ProductImageGallery';
import { AddToCartPanel } from './AddToCartPanel';
import type { IProduct, IResena } from '@src/core/models';

interface ProductDetailClientProps {
  product: IProduct;
  reviews: IResena[];
}

export function ProductDetailClient({ product, reviews: initialReviews }: ProductDetailClientProps) {
  const [reviews, setReviews] = useState<IResena[]>(initialReviews);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-14">
      <div className="mb-10">
        <Link
          href={ROUTES.CATALOG}
          className="text-sm font-medium text-[var(--color-brand)] hover:underline"
        >
          ← Volver al catálogo
        </Link>
      </div>

      {/* Grid principal */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        {/* Galería */}
        <ProductImageGallery images={product.images} />

        {/* Panel de compra */}
        <section className="space-y-8 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-md)]">
          {/* Categoría + nombre */}
          <div className="space-y-3">
            <div className="inline-flex rounded-full bg-[var(--color-brand-subtle)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand)]">
              {product.category}
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
              {product.name}
            </h1>
            <p className="text-sm leading-7 text-[var(--color-text-secondary)]">
              {product.description}
            </p>
            {product.tipo_tela && (
              <p className="text-xs text-[var(--color-text-muted)]">
                Material: <span className="font-medium text-[var(--color-text-secondary)]">{product.tipo_tela}</span>
              </p>
            )}
          </div>

          {/* Selector de talla, color, cantidad y botones */}
          <AddToCartPanel product={product} />

          {/* Tabla de medidas */}
          {Object.keys(product.medidas_dinamicas).length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Guía de tallas</p>
              <DynamicMeasurementsTable medidas={product.medidas_dinamicas} />
            </div>
          )}
        </section>
      </div>

      {/* Reseñas */}
      <section className="mt-16 space-y-6">
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Reseñas de clientes
          {reviews.length > 0 && (
            <span className="ml-2 text-lg font-normal text-[var(--color-text-muted)]">({reviews.length})</span>
          )}
        </h2>
        <ReviewList reviews={reviews} />
        <ReviewForm
          productId={product.id}
          onSuccess={(newReview) => setReviews((prev) => [...prev, newReview])}
        />
      </section>
    </div>
  );
}
