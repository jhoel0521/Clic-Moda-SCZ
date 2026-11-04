'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MessageCircle, Truck } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { toast } from '@src/core/store/useToastStore';
import { OrderService } from '@src/services/OrderService';
import { Input } from '@src/shared/ui/Input';
import { ROUTES } from '@src/routes';
import { checkoutSchema, type CheckoutFormData } from './checkout.schema';

export default function CheckoutPage() {
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState(false);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const appliedCoupon = useCheckoutStore((s) => s.appliedCoupon);
  const setLastOrder = useCheckoutStore((s) => s.setLastOrder);

  const discount = appliedCoupon?.valid ? appliedCoupon.discount : 0;
  const total = Math.max(0, subtotal - discount);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      phone: user?.phone ?? '',
      city: 'Santa Cruz de la Sierra',
    },
  });

  async function onSubmit(data: CheckoutFormData) {
    try {
      const order = await OrderService.createOrder({
        items,
        shippingAddress: {
          fullName: data.fullName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          reference: data.reference,
        },
        paymentMethod: 'whatsapp',
        notes: data.notes,
        customerId: user?.id,
        customerEmail: user?.email,
        couponCode: appliedCoupon?.codigo,
        discount,
      });

      setOrderPlaced(true);
      setLastOrder(order);
      clearCart();
      router.push(ROUTES.ORDER_DETAIL(order.id));
    } catch (error) {
      toast.error((error as Error).message || 'No se pudo crear el pedido. Intentá nuevamente.');
    }
  }

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) router.replace(ROUTES.CART);
  }, [items.length, orderPlaced, router]);

  if (items.length === 0) return null;

  return (
    <div className="page-with-cta mx-auto w-full max-w-2xl px-4 py-5 md:py-12">
      <h1 className="text-text-primary text-2xl font-bold md:text-3xl">¿A dónde lo enviamos?</h1>
      <p className="text-text-muted mt-1 mb-4 text-sm">
        El pago y la confirmación se hacen por WhatsApp.
      </p>

      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <section className="border-border bg-surface rounded-2xl border p-4 shadow-sm md:p-6">
          <h2 className="text-text-primary mb-4 flex items-center gap-2 font-bold">
            <Truck size={18} className="text-brand" />
            Datos de entrega
          </h2>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-4">
            <Input
              label="Nombre completo"
              autoComplete="name"
              autoCapitalize="words"
              placeholder="Nombre y apellido"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Teléfono"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="70000000"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Dirección"
              autoComplete="street-address"
              placeholder="Calle, número y barrio"
              error={errors.address?.message}
              {...register('address')}
            />
            <Input
              label="Ciudad"
              autoComplete="address-level2"
              error={errors.city?.message}
              {...register('city')}
            />
            <Input
              label="Referencia (opcional)"
              placeholder="Frente al parque"
              {...register('reference')}
            />
            <div>
              <label
                htmlFor="checkout-notes"
                className="text-text-primary mb-1.5 block text-sm font-medium"
              >
                Notas (opcional)
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                placeholder="Horario de entrega, indicaciones..."
                className="border-border text-text-primary placeholder:text-text-muted focus:ring-brand w-full rounded-xl border bg-white px-4 py-2.5 focus:ring-2 focus:outline-none"
                {...register('notes')}
              />
            </div>
          </div>
        </section>

        <section className="border-border bg-surface rounded-2xl border p-4 text-sm shadow-sm md:p-6">
          <h2 className="text-text-primary mb-3 text-base font-bold">Tu pedido</h2>
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={`${item.productId}-${item.selectedSize}-${item.selectedColor}`}
                className="flex justify-between gap-3"
              >
                <span className="text-text-secondary min-w-0">
                  {item.quantity} x {item.name}
                  <span className="text-text-muted block text-xs">
                    Talla {item.selectedSize} · {item.selectedColor}
                  </span>
                </span>
                <span className="text-text-primary font-medium whitespace-nowrap">
                  Bs. {(item.price * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-border mt-3 space-y-1.5 border-t pt-3">
            {discount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Descuento</span>
                <span className="whitespace-nowrap">−Bs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="text-text-secondary flex justify-between">
              <span>Envío</span>
              <span>Por cobrar</span>
            </div>
            <div className="text-text-primary flex justify-between text-base font-bold">
              <span>Total</span>
              <span className="whitespace-nowrap">Bs. {total.toFixed(2)}</span>
            </div>
          </div>
        </section>
      </form>

      {/* Barra de acción */}
      <div className="safe-bottom-3 fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white px-4 pt-3">
        <button
          type="submit"
          form="checkout-form"
          disabled={isSubmitting}
          className="mx-auto flex h-12 w-full max-w-2xl items-center justify-center gap-2 rounded-xl bg-gray-900 font-bold text-white active:bg-black disabled:opacity-60"
        >
          <MessageCircle size={18} />
          Continuar a WhatsApp
        </button>
      </div>
    </div>
  );
}
