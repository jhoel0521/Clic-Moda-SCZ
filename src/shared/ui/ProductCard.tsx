'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { ROUTES } from '@src/routes';
import type { IProduct } from '@src/core/models';

interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;

  return (
    <Link href={ROUTES.PRODUCT(product.slug)} className="group block">
      <article className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_0_0_0_transparent] transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-border-brand)] hover:shadow-[var(--shadow-brand)]">
        {/* Imagen */}
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-surface-raised)]">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              loading={priority ? 'eager' : 'lazy'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--color-surface-raised)]">
              <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFlashSale && (
              <span className="rounded-full bg-[var(--gradient-brand)] px-2 py-0.5 text-[11px] font-bold text-white">
                FLASH
              </span>
            )}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-white bg-black/70 backdrop-blur-sm">
                -{discountPct}%
              </span>
            )}
            {!product.isFlashSale && product.stock <= 5 && product.stock > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold text-amber-800 bg-amber-100">
                Últimas {product.stock}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-5 space-y-2">
          <p className="line-clamp-2 text-sm font-semibold leading-snug text-[var(--color-text-primary)]">
            {product.name}
          </p>

          {product.rating != null && (
            <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              <span>{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-[var(--color-text-primary)]">Bs. {product.price}</span>
            {hasDiscount && (
              <span className="text-sm line-through text-[var(--color-text-muted)]">
                Bs. {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
