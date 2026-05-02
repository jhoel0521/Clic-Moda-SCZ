'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Truck, ChevronRight } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { ROUTES } from '@src/routes';
import { CartItemRow } from './CartItemRow';
import { CouponInput } from './CouponInput';
import type { IAplicacionCupon } from '@src/core/models';

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setAppliedCoupon = useCheckoutStore((s) => s.setAppliedCoupon);

  const [appliedCoupon, setLocalCoupon] = useState<IAplicacionCupon | null>(null);

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  function handleApplyCoupon(coupon: IAplicacionCupon) {
    setLocalCoupon(coupon);
    setAppliedCoupon(coupon);
  }

  function handleRemoveCoupon() {
    setLocalCoupon(null);
    setAppliedCoupon(null);
  }

  function goToCheckout() {
    router.push(ROUTES.CHECKOUT);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center shadow-sm">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-300" />
            <p className="mb-6 text-xl font-medium text-gray-500">Tu carrito está vacío</p>
            <Link
              href={ROUTES.CATALOG}
              className="inline-block rounded-xl bg-pink-600 px-8 py-3 font-bold text-white shadow-md transition-colors hover:bg-pink-700"
            >
              Ir de compras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-12">
        {/* Título */}
        <h1 className="mb-8 flex items-center gap-3 text-3xl font-black text-gray-900 md:text-4xl">
          <ShoppingCart className="h-8 w-8 text-pink-500 md:h-10 md:w-10" />
          Tu Carrito
          <span className="text-lg font-normal text-gray-400">
            ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
          </span>
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* LEFT — Lista de ítems (2/3) */}
          <div className="w-full space-y-4 lg:w-2/3">
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
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <p className="mb-3 text-sm font-bold text-gray-900">¿Tenés un cupón?</p>
              <CouponInput
                subtotal={subtotal}
                appliedCoupon={appliedCoupon}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
              />
            </div>

            <Link
              href={ROUTES.CATALOG}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-pink-600 hover:underline"
            >
              ← Seguir comprando
            </Link>
          </div>

          {/* RIGHT — Resumen (1/3) */}
          <div className="w-full lg:w-1/3">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 lg:sticky lg:top-20">
              <h3 className="mb-6 border-b border-gray-100 pb-4 text-2xl font-black text-gray-900">
                Resumen
              </h3>

              <div className="mb-4 flex justify-between text-lg text-gray-600">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">Bs. {subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon?.valid && (
                <div className="mb-4 flex justify-between text-green-700">
                  <span>Descuento ({appliedCoupon.porcentaje}%)</span>
                  <span className="font-bold">−Bs. {discount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping notice — ALWAYS visible */}
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
                <div>
                  <p className="text-sm font-bold text-yellow-800">Envío: ¡Por cobrar!</p>
                  <p className="mt-1 text-xs text-yellow-700">
                    El costo de envío se paga al recibir el paquete (Uber/Terminal) dependiendo de
                    tu zona.
                  </p>
                </div>
              </div>

              <div className="mb-8 flex items-end justify-between border-t border-gray-100 pt-4">
                <span className="text-lg font-bold text-gray-600">Total a Pagar</span>
                <span className="text-3xl font-black text-pink-600 md:text-4xl">
                  Bs. {total.toFixed(2)}
                </span>
              </div>

              {/* CTA Desktop */}
              <button
                type="button"
                onClick={goToCheckout}
                className="hidden w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-4 text-lg font-black text-white shadow-xl transition-colors hover:bg-pink-600 active:scale-95 md:flex"
              >
                PROCEDER AL PAGO <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Flotante Mobile */}
      <div className="fixed right-0 bottom-16 left-0 z-40 border-t border-gray-200 bg-white p-3 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] md:hidden">
        <button
          type="button"
          onClick={goToCheckout}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 py-4 text-lg font-black text-white shadow-lg transition-transform hover:bg-pink-700 active:scale-95"
        >
          IR A PAGAR <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
