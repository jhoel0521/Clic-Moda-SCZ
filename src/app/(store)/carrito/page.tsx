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
      <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300 shadow-sm">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl font-medium mb-6">Tu carrito está vacío</p>
            <Link
              href={ROUTES.CATALOG}
              className="inline-block bg-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-pink-700 transition-colors"
            >
              Ir de compras
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">

        {/* Título */}
        <h1 className="font-black text-3xl md:text-4xl mb-8 flex items-center gap-3 text-gray-900">
          <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />
          Tu Carrito
          <span className="text-lg font-normal text-gray-400">
            ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* LEFT — Lista de ítems (2/3) */}
          <div className="w-full lg:w-2/3 space-y-4">
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
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <p className="font-bold text-gray-900 mb-3 text-sm">¿Tenés un cupón?</p>
              <CouponInput
                subtotal={subtotal}
                appliedCoupon={appliedCoupon}
                onApply={handleApplyCoupon}
                onRemove={handleRemoveCoupon}
              />
            </div>

            <Link
              href={ROUTES.CATALOG}
              className="inline-flex items-center gap-1.5 text-sm text-pink-600 font-medium hover:underline"
            >
              ← Seguir comprando
            </Link>
          </div>

          {/* RIGHT — Resumen (1/3) */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-20">
              <h3 className="font-black text-2xl border-b border-gray-100 pb-4 mb-6 text-gray-900">
                Resumen
              </h3>

              <div className="flex justify-between mb-4 text-gray-600 text-lg">
                <span>Subtotal</span>
                <span className="font-bold text-gray-900">Bs. {subtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon?.valid && (
                <div className="flex justify-between mb-4 text-green-700">
                  <span>Descuento ({appliedCoupon.porcentaje}%)</span>
                  <span className="font-bold">−Bs. {discount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping notice — ALWAYS visible */}
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-6 flex gap-3 items-start">
                <Truck className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-yellow-800 text-sm">Envío: ¡Por cobrar!</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    El costo de envío se paga al recibir el paquete (Uber/Terminal) dependiendo de tu zona.
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-100 pt-4 mb-8">
                <span className="font-bold text-gray-600 text-lg">Total a Pagar</span>
                <span className="font-black text-3xl md:text-4xl text-pink-600">
                  Bs. {total.toFixed(2)}
                </span>
              </div>

              {/* CTA Desktop */}
              <button
                type="button"
                onClick={goToCheckout}
                className="hidden md:flex w-full bg-gray-900 hover:bg-pink-600 text-white font-black py-4 rounded-xl text-lg shadow-xl transition-colors justify-center items-center gap-2 active:scale-95"
              >
                PROCEDER AL PAGO <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* CTA Flotante Mobile */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-3 z-40 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)]">
        <button
          type="button"
          onClick={goToCheckout}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-4 rounded-xl text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
        >
          IR A PAGAR <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
