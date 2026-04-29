'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { Button } from '@src/shared/ui/Button';
import { ROUTES } from '@src/routes';
import { CartItemRow } from './CartItemRow';
import { CouponInput } from './CouponInput';
import { OrderSummary } from './OrderSummary';
import type { IAplicacionCupon } from '@src/core/models';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const [appliedCoupon, setAppliedCoupon] = useState<IAplicacionCupon | null>(null);

  if (items.length === 0) {
    return (
      <>
        <div className="mb-6 text-7xl">🛒</div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--color-text-primary)]">Tu carrito está vacío</h1>
        <p className="mb-8 text-[var(--color-text-muted)]">
          Explorá el catálogo y encontrá tu prenda ideal.
        </p>
        <Link href={ROUTES.CATALOG}>
          <Button variant="primary" size="lg">Ver catálogo</Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center gap-3">
        <ShoppingCart size={28} className="text-[var(--color-brand)]" />
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
          Tu carrito
          <span className="ml-2 text-lg font-normal text-[var(--color-text-muted)]">
            ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
          </span>
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        {/* Lista de ítems */}
        <div className="space-y-4">
          {items.map((item) => (
            <CartItemRow
              key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
              item={item}
              onRemove={() => removeItem(item.productId, item.selectedSize, item.selectedColor)}
              onUpdateQty={(qty) => {
                if (qty <= 0) {
                  removeItem(item.productId, item.selectedSize, item.selectedColor);
                } else {
                  updateQuantity(item.productId, item.selectedSize, item.selectedColor, qty);
                }
              }}
            />
          ))}

          {/* Cupón */}
          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
            <p className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">¿Tenés un cupón?</p>
            <CouponInput
              subtotal={subtotal}
              appliedCoupon={appliedCoupon}
              onApply={setAppliedCoupon}
              onRemove={() => setAppliedCoupon(null)}
            />
          </div>

          <Link
            href={ROUTES.CATALOG}
            className="inline-flex items-center gap-1.5 text-sm text-[var(--color-brand)] font-medium hover:underline"
          >
            ← Seguir comprando
          </Link>
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-24">
          <OrderSummary subtotal={subtotal} appliedCoupon={appliedCoupon} />
        </div>
      </div>
    </>
  );
}
