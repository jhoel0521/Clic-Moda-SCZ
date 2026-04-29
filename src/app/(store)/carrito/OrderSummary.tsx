'use client';

import { useRouter } from 'next/navigation';
import { ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@src/shared/ui/Button';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { ROUTES } from '@src/routes';
import type { IAplicacionCupon } from '@src/core/models';

interface OrderSummaryProps {
  subtotal: number;
  appliedCoupon: IAplicacionCupon | null;
}

export function OrderSummary({ subtotal, appliedCoupon }: OrderSummaryProps) {
  const router = useRouter();
  const setAppliedCoupon = useCheckoutStore((s) => s.setAppliedCoupon);
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  function handleCheckout() {
    setAppliedCoupon(appliedCoupon);
    router.push(ROUTES.CHECKOUT);
  }

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] space-y-4">
      <h2 className="font-bold text-[var(--color-text-primary)]">Resumen del pedido</h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-[var(--color-text-secondary)]">
          <span>Subtotal</span>
          <span className="font-medium text-[var(--color-text-primary)]">Bs. {subtotal.toFixed(2)}</span>
        </div>

        {appliedCoupon?.valid && (
          <div className="flex justify-between text-green-700">
            <span>Descuento ({appliedCoupon.codigo})</span>
            <span className="font-medium">−Bs. {discount.toFixed(2)}</span>
          </div>
        )}

        {/* Línea obligatoria de envío */}
        <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2.5 border border-amber-200">
          <span className="flex items-center gap-2 text-amber-700 font-medium">
            <Truck size={14} />
            Envío
          </span>
          <span className="font-bold text-amber-700">Por cobrar</span>
        </div>

        <div className="h-px bg-[var(--color-border)]" />

        <div className="flex justify-between text-base font-bold text-[var(--color-text-primary)]">
          <span>Total estimado</span>
          <span>Bs. {total.toFixed(2)}</span>
        </div>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleCheckout}
        leftIcon={<ShoppingBag size={18} />}
      >
        Ir al Checkout
      </Button>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        El costo de envío se coordinará por WhatsApp
      </p>
    </div>
  );
}
