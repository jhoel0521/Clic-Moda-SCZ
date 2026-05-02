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
      <article className="border-border bg-surface hover:border-border-brand hover:shadow-brand overflow-hidden rounded-2xl border shadow-[0_0_0_0_transparent] transition-all duration-300 hover:-translate-y-1">
        {/* Imagen */}
        <div className="bg-surface-raised relative aspect-[3/4] overflow-hidden">
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
            <div className="bg-surface-raised flex h-full w-full items-center justify-center">
              <svg
                className="h-12 w-12 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.isFlashSale && (
              <span className="bg-gradient-brand rounded-full px-2 py-0.5 text-[11px] font-bold text-white">
                FLASH
              </span>
            )}
            {hasDiscount && (
              <span className="rounded-full bg-black/70 px-2 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm">
                -{discountPct}%
              </span>
            )}
            {!product.isFlashSale && product.stock <= 5 && product.stock > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                Últimas {product.stock}
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 p-5">
          <p className="text-text-primary line-clamp-2 text-sm leading-snug font-semibold">
            {product.name}
          </p>

          {product.tagNames.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.tagNames.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {product.rating != null && (
            <div className="text-text-muted flex items-center gap-1 text-xs">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              <span>{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-primary text-base font-bold">Bs. {product.price}</span>
            {hasDiscount && (
              <span className="text-text-muted text-sm line-through">
                Bs. {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
