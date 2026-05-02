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
    <div className="border-border bg-surface space-y-4 rounded-2xl border p-6 shadow-sm">
      <h2 className="text-text-primary font-bold">Resumen del pedido</h2>

      <div className="space-y-3 text-sm">
        <div className="text-text-secondary flex justify-between">
          <span>Subtotal</span>
          <span className="text-text-primary font-medium">Bs. {subtotal.toFixed(2)}</span>
        </div>

        {appliedCoupon?.valid && (
          <div className="flex justify-between text-green-700">
            <span>Descuento ({appliedCoupon.codigo})</span>
            <span className="font-medium">−Bs. {discount.toFixed(2)}</span>
          </div>
        )}

        {/* Línea obligatoria de envío */}
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <span className="flex items-center gap-2 font-medium text-amber-700">
            <Truck size={14} />
            Envío
          </span>
          <span className="font-bold text-amber-700">Por cobrar</span>
        </div>

        <div className="bg-border h-px" />

        <div className="text-text-primary flex justify-between text-base font-bold">
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

      <p className="text-text-muted text-center text-xs">
        El costo de envío se coordinará por WhatsApp
      </p>
    </div>
  );
}
