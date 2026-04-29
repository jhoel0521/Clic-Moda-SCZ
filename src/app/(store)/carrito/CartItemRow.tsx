'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import type { ICartItem } from '@src/core/models';

interface CartItemRowProps {
  item: ICartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}

export function CartItemRow({ item, onRemove, onUpdateQty }: CartItemRowProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)]">
      {/* Imagen */}
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--color-surface-raised)]">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">👗</div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-[var(--color-text-primary)] line-clamp-2">{item.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Talla: <span className="font-medium">{item.selectedSize}</span>
              {item.selectedColor && (
                <> · Color: <span className="font-medium">{item.selectedColor}</span></>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-lg p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-red-50 hover:text-[var(--color-danger)]"
            aria-label="Eliminar ítem"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Cantidad */}
          <div className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] bg-white p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Reducir cantidad"
            >
              <Minus size={12} />
            </button>
            <span className="w-6 text-center text-sm font-bold text-[var(--color-text-primary)]">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="flex h-6 w-6 items-center justify-center rounded text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Precio total del ítem */}
          <p className="font-bold text-[var(--color-text-primary)]">
            Bs. {(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
