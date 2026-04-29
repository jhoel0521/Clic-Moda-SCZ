'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { IImage } from '@src/core/models';

interface ProductImageGalleryProps {
  images: IImage[];
}

export function ProductImageGallery({ images }: ProductImageGalleryProps) {
  const primaryIdx = images.findIndex((img) => img.isPrimary);
  const [selectedIdx, setSelectedIdx] = useState(primaryIdx >= 0 ? primaryIdx : 0);
  const selected = images[selectedIdx] ?? images[0];

  if (!selected) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
        <div className="relative aspect-[4/5] bg-[var(--color-surface-raised)]">
          <Image
            src={selected.url}
            alt={selected.alt}
            fill
            priority
            className="object-cover transition-opacity duration-300"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, idx) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={[
                'relative aspect-square overflow-hidden rounded-2xl border-2 transition-all duration-150',
                idx === selectedIdx
                  ? 'border-[var(--color-brand)] shadow-[var(--shadow-brand)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
              ].join(' ')}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="120px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
