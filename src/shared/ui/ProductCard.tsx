'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { ROUTES } from '@src/routes';
import { colorSwatch } from '@src/core/constants/CATALOG';
import type { IProduct } from '@src/core/models';

interface ProductCardProps {
  product: IProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const image = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const hasDiscount = product.originalPrice != null && product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.originalPrice!) * 100)
    : 0;
  const totalStock = Object.values(product.stock).reduce((sum, quantity) => sum + quantity, 0);
  const isOutOfStock = totalStock <= 0;

  const content = (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
        {image && (
          <Image
            src={image.url}
            alt={image.alt}
            fill
            className={`object-cover ${isOutOfStock ? 'grayscale' : ''}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        )}

        <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
          {hasDiscount && (
            <span className="rounded-full bg-pink-600 px-2 py-0.5 text-[11px] font-bold text-white">
              -{discountPct}%
            </span>
          )}
          {isOutOfStock ? (
            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-[11px] font-bold text-white">
              Agotado
            </span>
          ) : (
            totalStock <= 8 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                Últimos pares
              </span>
            )
          )}
        </div>
      </div>

      <div className="space-y-1 p-3">
        <p className="line-clamp-1 text-sm font-semibold text-gray-900">{product.name}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-gray-900">Bs. {product.price}</span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">Bs. {product.originalPrice}</span>
          )}
        </div>
        <div className="flex h-4 items-center justify-between">
          <span className="flex gap-1">
            {product.colors.slice(0, 4).map((color) => (
              <span
                key={color}
                title={color}
                className="h-3 w-3 rounded-full border border-black/15"
                style={{ background: colorSwatch(color) }}
              />
            ))}
          </span>
          {product.rating != null && (
            <span className="flex items-center gap-0.5 text-xs text-gray-500">
              <Star size={11} className="fill-yellow-400 text-yellow-400" />
              {product.rating}
            </span>
          )}
        </div>
      </div>
    </article>
  );

  if (isOutOfStock) {
    return <div className="block opacity-80">{content}</div>;
  }

  return (
    <Link href={ROUTES.PRODUCT(product.slug)} className="block active:opacity-80">
      {content}
    </Link>
  );
}
