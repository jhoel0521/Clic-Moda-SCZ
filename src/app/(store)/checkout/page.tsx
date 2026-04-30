'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { OrderService } from '@src/services/OrderService';
import { ProductService } from '@src/services/ProductService';
import { Button } from '@src/shared/ui/Button';
import { Input } from '@src/shared/ui/Input';
import { PaymentMethodCard } from '@src/shared/ui/forms/PaymentMethodCard';
import { ROUTES } from '@src/routes';
import { checkoutSchema, type CheckoutFormData } from './checkout.schema';

const PAYMENT_OPTIONS = [
  { value: 'transferencia',    label: 'Transferencia bancaria', icon: '🏦', description: 'Datos bancarios por WhatsApp' },
  { value: 'qr_simple',       label: 'QR Simple',              icon: '📱', description: 'Escaneá y pagá al instante' },
  { value: 'efectivo_entrega', label: 'Efectivo en entrega',    icon: '💵', description: 'Pagás cuando recibís' },
  { value: 'contra_entrega',   label: 'Contra entrega',         icon: '📦', description: 'Coordinamos por WhatsApp' },
] as const;

const STEPS = [
  { id: 1, label: 'Entrega',  icon: Truck },
  { id: 2, label: 'Pago',    icon: CreditCard },
  { id: 3, label: 'Confirmar' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={[
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
              done   ? 'bg-green-500 text-white'
              : active ? 'bg-gray-900 text-white'
              : 'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]',
            ].join(' ')}>
              {done ? '✓' : step.id}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${active ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-px transition-colors ${done ? 'bg-green-400' : 'bg-[var(--color-border)]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const items      = useCartStore((s) => s.items);
  const subtotal   = useCartStore((s) => s.subtotal);
  const clearCart  = useCartStore((s) => s.clearCart);
  const user       = useAuthStore((s) => s.user);
  const appliedCoupon = useCheckoutStore((s) => s.appliedCoupon);
  const setLastOrder  = useCheckoutStore((s) => s.setLastOrder);

  useEffect(() => {
    if (items.length === 0) router.replace(ROUTES.CART);
  }, [items.length, router]);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: user?.name ?? '',
      city: 'Santa Cruz de la Sierra',
      paymentMethod: 'qr_simple',
    },
  });

  const selectedPayment = watch('paymentMethod');
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  async function goToStep2() {
    const valid = await trigger(['fullName', 'phone', 'address', 'city']);
    if (valid) setStep(2);
  }

  async function onSubmit(data: CheckoutFormData) {
    const order = await OrderService.createOrder({
      items,
      shippingAddress: {
        fullName:  data.fullName,
        phone:     data.phone,
        address:   data.address,
        city:      data.city,
        reference: data.reference,
      },
      paymentMethod:  data.paymentMethod,
      notes:          data.notes,
      customerId:     user?.id,
      customerEmail:  user?.email,
      couponCode:     appliedCoupon?.codigo,
      discount,
    });

    items.forEach((item) => {
      ProductService.decrementStock(item.productId, item.quantity);
    });

    setLastOrder(order);
    clearCart();
    router.push(ROUTES.CHECKOUT_CONFIRMATION);
  }

  if (items.length === 0) return null;

  /* ────────────────── ORDER SUMMARY (sidebar) ────────────────── */
  const OrderSidebar = (
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
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Finalizar pedido</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">Completá tus datos y elegí cómo pagar.</p>
      </div>

      <StepIndicator current={step} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            {/* PASO 1: Datos de entrega */}
            {step === 1 && (
              <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
                <h2 className="mb-6 flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
                  <Truck size={18} className="text-[var(--color-brand)]" />
                  Datos de entrega
                </h2>
                <div className="grid gap-5 sm:grid-cols-2">
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
                <div className="mt-8">
                  <Button type="button" variant="primary" size="lg" fullWidth onClick={goToStep2} rightIcon={<ChevronRight size={18} />}>
                    Continuar al pago
                  </Button>
                </div>
              </section>
            )}

            {/* PASO 2: Método de pago */}
            {step === 2 && (
              <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
                <h2 className="mb-6 flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
                  <CreditCard size={18} className="text-[var(--color-brand)]" />
                  Método de pago
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PAYMENT_OPTIONS.map(({ value, label, icon, description }) => (
                    <PaymentMethodCard
                      key={value}
                      value={value}
                      label={label}
                      icon={icon}
                      description={description}
                      selected={selectedPayment === value}
                      onChange={(v) => setValue('paymentMethod', v as CheckoutFormData['paymentMethod'])}
                    />
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="mt-2 text-xs text-[var(--color-danger)]">{errors.paymentMethod.message}</p>
                )}
                <div className="mt-8 flex gap-3">
                  <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)} leftIcon={<ChevronLeft size={18} />}>
                    Atrás
                  </Button>
                  <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isSubmitting}>
                    Confirmar pedido
                  </Button>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar resumen — sticky */}
          <div className="lg:sticky lg:top-20">
            {OrderSidebar}
          </div>
        </div>
      </form>
    </div>
  );
}
