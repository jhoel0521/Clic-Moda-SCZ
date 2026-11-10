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
    <div className="border-border bg-surface flex gap-4 rounded-2xl border p-4 shadow-sm">
      {/* Imagen */}
      <div className="bg-surface-raised relative h-24 w-20 shrink-0 overflow-hidden rounded-xl">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">👗</div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-text-primary line-clamp-2 text-sm font-semibold">{item.name}</p>
            <p className="text-text-muted mt-0.5 text-xs">
              Talla: <span className="font-medium">{item.selectedSize}</span>
              {item.selectedColor && (
                <>
                  {' '}
                  · Color: <span className="font-medium">{item.selectedColor}</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-text-muted hover:text-danger shrink-0 rounded-lg p-1.5 transition-colors hover:bg-red-50"
            aria-label="Eliminar ítem"
          >
            <Trash2 size={15} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          {/* Cantidad */}
          <div className="border-border inline-flex items-center gap-1.5 rounded-lg border bg-white p-0.5">
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="text-text-muted hover:bg-surface-hover flex h-6 w-6 items-center justify-center rounded transition-colors"
              aria-label="Reducir cantidad"
            >
              <Minus size={12} />
            </button>
            <span className="text-text-primary w-6 text-center text-sm font-bold">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="text-text-muted hover:bg-surface-hover flex h-6 w-6 items-center justify-center rounded transition-colors"
              aria-label="Aumentar cantidad"
            >
              <Plus size={12} />
            </button>
          </div>

          {/* Precio total del ítem */}
          <p className="text-text-primary font-bold">
            Bs. {(item.price * item.quantity).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
