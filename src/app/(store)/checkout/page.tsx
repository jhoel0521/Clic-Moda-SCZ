'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, CreditCard } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { OrderService } from '@src/services/OrderService';
import { ProductService } from '@src/services/ProductService';
import { Button } from '@src/shared/ui/Button';
import { Input } from '@src/shared/ui/Input';
import { ROUTES } from '@src/routes';
import { checkoutSchema, type CheckoutFormData } from './checkout.schema';

const PAYMENT_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia bancaria', icon: '🏦' },
  { value: 'qr_simple', label: 'QR Simple', icon: '📱' },
  { value: 'efectivo_entrega', label: 'Efectivo en entrega', icon: '💵' },
  { value: 'contra_entrega', label: 'Contra entrega', icon: '📦' },
] as const;

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const appliedCoupon = useCheckoutStore((s) => s.appliedCoupon);
  const setLastOrder = useCheckoutStore((s) => s.setLastOrder);

  useEffect(() => {
    if (items.length === 0) router.replace(ROUTES.CART);
  }, [items.length, router]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      paymentMethod: 'qr_simple',
    },
  });

  const selectedPayment = useWatch({ control, name: 'paymentMethod' });
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  async function onSubmit(data: CheckoutFormData) {
    const order = await OrderService.createOrder({
      items,
      shippingAddress: {
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
        reference: data.reference,
      },
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      customerId: user?.id,
      customerEmail: user?.email,
      couponCode: appliedCoupon?.codigo,
      discount,
    });

    // Decrementar stock (fire-and-forget)
    items.forEach((item) => {
      ProductService.decrementStock(item.productId, item.quantity);
    });

    setLastOrder(order);
    clearCart();
    router.push(ROUTES.CHECKOUT_CONFIRMATION);
  }

  if (items.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Finalizar pedido</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">Completá tus datos y elegí cómo pagar.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
          {/* Formulario de envío */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="mb-5 flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
                <Truck size={18} className="text-[var(--color-brand)]" />
                Datos de entrega
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Nombre completo"
                  placeholder="María García"
                  error={errors.fullName?.message}
                  {...register('fullName')}
                />
                <Input
                  label="Teléfono"
                  placeholder="70000000"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Dirección"
                    placeholder="Av. Ejemplo 123, Barrio Las Palmas"
                    error={errors.address?.message}
                    {...register('address')}
                  />
                </div>
                <Input
                  label="Ciudad"
                  placeholder="Santa Cruz de la Sierra"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <Input
                  label="Referencia (opcional)"
                  placeholder="Frente al parque"
                  error={errors.reference?.message}
                  {...register('reference')}
                />
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Instrucciones especiales para el envío..."
                    className="w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
                    {...register('notes')}
                  />
                </div>
              </div>
            </section>

            {/* Método de pago */}
            <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="mb-5 flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
                <CreditCard size={18} className="text-[var(--color-brand)]" />
                Método de pago
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {PAYMENT_OPTIONS.map(({ value, label, icon }) => (
                  <label
                    key={value}
                    className={[
                      'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all',
                      selectedPayment === value
                        ? 'border-[var(--color-brand)] bg-[var(--color-brand-subtle)]'
                        : 'border-[var(--color-border)] hover:border-[var(--color-border-hover)]',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      value={value}
                      className="sr-only"
                      {...register('paymentMethod')}
                    />
                    <span className="text-2xl">{icon}</span>
                    <span className={[
                      'text-sm font-medium',
                      selectedPayment === value ? 'text-[var(--color-brand)]' : 'text-[var(--color-text-secondary)]',
                    ].join(' ')}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.paymentMethod && (
                <p className="mt-2 text-xs text-[var(--color-danger)]">{errors.paymentMethod.message}</p>
              )}
            </section>
          </div>

          {/* Resumen del pedido */}
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
              <h2 className="mb-4 font-bold text-[var(--color-text-primary)]">Tu pedido</h2>

              <div className="space-y-3 text-sm">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.selectedSize}`} className="flex justify-between gap-2">
                    <span className="text-[var(--color-text-secondary)] line-clamp-1">
                      {item.name}
                      <span className="text-[var(--color-text-muted)]"> × {item.quantity}</span>
                    </span>
                    <span className="shrink-0 font-medium text-[var(--color-text-primary)]">
                      Bs. {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
                <div className="flex justify-between text-[var(--color-text-secondary)]">
                  <span>Subtotal</span>
                  <span>Bs. {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <span>Descuento</span>
                    <span>−Bs. {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between rounded-xl bg-amber-50 px-3 py-2 border border-amber-200">
                  <span className="font-medium text-amber-700">Envío</span>
                  <span className="font-bold text-amber-700">Por cobrar</span>
                </div>
                <div className="flex justify-between font-bold text-base text-[var(--color-text-primary)] border-t border-[var(--color-border)] pt-2">
                  <span>Total estimado</span>
                  <span>Bs. {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Confirmar pedido
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
