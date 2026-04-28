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
            <div className="w-full h-full flex items-center justify-center text-5xl">
              👗
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
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
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
