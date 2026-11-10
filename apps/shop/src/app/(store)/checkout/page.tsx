'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Truck, CreditCard, ChevronRight, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { OrderService } from '@src/services/OrderService';
import { Button } from '@src/shared/ui/Button';
import { Input } from '@src/shared/ui/Input';
import { PaymentMethodCard } from '@src/shared/ui/forms/PaymentMethodCard';
import { ROUTES } from '@src/routes';
import { envConfig } from '@src/core/config/env.config';
import { checkoutSchema, type CheckoutFormData } from './checkout.schema';

const PAYMENT_OPTIONS = [
  {
    value: 'transferencia',
    label: 'Transferencia bancaria',
    icon: '🏦',
    description: 'Datos bancarios por WhatsApp',
  },
  { value: 'qr_simple', label: 'QR Simple', icon: '📱', description: 'Escaneá y pagá al instante' },
  {
    value: 'efectivo_entrega',
    label: 'Efectivo en entrega',
    icon: '💵',
    description: 'Pagás cuando recibís',
  },
  {
    value: 'contra_entrega',
    label: 'Contra entrega',
    icon: '📦',
    description: 'Coordinamos por WhatsApp',
  },
] as const;

const STEPS = [
  { id: 1, label: 'Entrega', icon: Truck },
  { id: 2, label: 'Pago', icon: CreditCard },
  { id: 3, label: 'Confirmar' },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="mb-10 flex items-center gap-2">
      {STEPS.map((step, idx) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex flex-1 items-center gap-2 last:flex-none">
            <div
              className={[
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                done
                  ? 'bg-green-500 text-white'
                  : active
                    ? 'bg-gray-900 text-white'
                    : 'bg-surface-raised text-text-muted',
              ].join(' ')}
            >
              {done ? '✓' : step.id}
            </div>
            <span
              className={`hidden text-sm font-medium sm:block ${active ? 'text-text-primary' : 'text-text-muted'}`}
            >
              {step.label}
            </span>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 transition-colors ${done ? 'bg-green-400' : 'bg-border'}`}
              />
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
  const [orderPlaced, setOrderPlaced] = useState(false);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const appliedCoupon = useCheckoutStore((s) => s.appliedCoupon);
  const setLastOrder = useCheckoutStore((s) => s.setLastOrder);

  const {
    register,
    handleSubmit,
    trigger,
    control,
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

  const selectedPayment = useWatch({ control, name: 'paymentMethod' });
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  async function goToStep2() {
    const valid = await trigger(['fullName', 'phone', 'address', 'city']);
    if (valid) setStep(2);
  }

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
        paymentMethod: data.paymentMethod,
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
      console.error('Error al crear la orden:', error);
      // El stock insuficiente se manejará en el error
      const message = (error as Error).message;
      if (message.includes('Stock insuficiente')) {
        // Mostrar toast de error de stock
        alert(message);
      } else {
        alert('Error al procesar la orden. Intente nuevamente.');
      }
    }
  }

  useEffect(() => {
    if (!isAuthenticated) router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.CHECKOUT}`);
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced) router.replace(ROUTES.CART);
  }, [items.length, orderPlaced, router]);

  if (items.length === 0) return null;

  /* ────────────────── ORDER SUMMARY (sidebar) ────────────────── */
  const OrderSidebar = (
    <div className="border-border bg-surface rounded-2xl border p-6 shadow-sm">
      <h2 className="text-text-primary mb-4 font-bold">Tu pedido</h2>
      <div className="space-y-3 text-sm">
        {items.map((item) => (
          <div
            key={`${item.productId}-${item.selectedSize}`}
            className="flex justify-between gap-2"
          >
            <span className="text-text-secondary line-clamp-1">
              {item.name}
              <span className="text-text-muted"> × {item.quantity}</span>
            </span>
            <span className="text-text-primary shrink-0 font-medium">
              Bs. {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <div className="border-border mt-4 space-y-2 border-t pt-4 text-sm">
        <div className="text-text-secondary flex justify-between">
          <span>Subtotal</span>
          <span>Bs. {subtotal.toFixed(2)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Descuento</span>
            <span>−Bs. {discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
          <span className="font-medium text-amber-700">Envío</span>
          <span className="font-bold text-amber-700">Por cobrar</span>
        </div>
        <div className="text-text-primary border-border flex justify-between border-t pt-2 text-base font-bold">
          <span>Total estimado</span>
          <span>Bs. {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-text-primary text-3xl font-bold">Finalizar pedido</h1>
        <p className="text-text-muted mt-1">Completá tus datos y elegí cómo pagar.</p>
      </div>

      <StepIndicator current={step} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div>
            {/* PASO 1: Datos de entrega */}
            {step === 1 && (
              <section className="border-border bg-surface rounded-2xl border p-6 shadow-sm">
                <h2 className="text-text-primary mb-6 flex items-center gap-2 font-bold">
                  <Truck size={18} className="text-brand" />
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
                    <label className="text-text-primary mb-1.5 block text-sm font-medium">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Instrucciones especiales para el envío..."
                      className="border-border text-text-primary placeholder:text-text-muted focus:ring-brand w-full rounded-xl border bg-white px-4 py-2.5 text-sm focus:ring-2 focus:outline-none"
                      {...register('notes')}
                    />
                  </div>
                </div>
                <div className="mt-8">
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={goToStep2}
                    rightIcon={<ChevronRight size={18} />}
                  >
                    Continuar al pago
                  </Button>
                </div>
              </section>
            )}

            {/* PASO 2: Método de pago */}
            {step === 2 && (
              <section className="border-border bg-surface rounded-2xl border p-6 shadow-sm">
                <h2 className="text-text-primary mb-6 flex items-center gap-2 font-bold">
                  <CreditCard size={18} className="text-brand" />
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
                      onChange={(v) =>
                        setValue('paymentMethod', v as CheckoutFormData['paymentMethod'])
                      }
                    />
                  ))}
                </div>
                {errors.paymentMethod && (
                  <p className="text-danger mt-2 text-xs">{errors.paymentMethod.message}</p>
                )}

                {/* Panel contextual según método seleccionado */}
                {selectedPayment === 'transferencia' && (
                  <div className="border-border bg-surface mt-4 overflow-hidden rounded-2xl border shadow-sm">
                    <div className="bg-bg-secondary border-border border-b px-5 py-3">
                      <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                        <span>🏦</span> Datos para transferencia bancaria
                      </p>
                    </div>
                    <div className="divide-border divide-y text-sm">
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-text-muted">Banco</span>
                        <span className="text-text-primary font-semibold">
                          {envConfig.bank.name}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-text-muted">N° de cuenta</span>
                        <span className="text-text-primary font-mono font-semibold">
                          {envConfig.bank.account}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-text-muted">Titular</span>
                        <span className="text-text-primary font-semibold">
                          {envConfig.bank.holder}
                        </span>
                      </div>
                      <div className="flex justify-between px-5 py-3">
                        <span className="text-text-muted">CI / NIT</span>
                        <span className="text-text-primary font-mono font-semibold">
                          {envConfig.bank.ci}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-muted px-5 py-3 text-xs">
                      Enviá el comprobante por WhatsApp con tu número de ticket.
                    </p>
                  </div>
                )}

                {selectedPayment === 'qr_simple' && (
                  <div className="border-border bg-surface mt-4 overflow-hidden rounded-2xl border shadow-sm">
                    <div className="bg-bg-secondary border-border border-b px-5 py-3">
                      <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
                        <span>📱</span> Código QR para pago
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-3 px-5 py-5">
                      {envConfig.paymentQrUrl ? (
                        <Image
                          src={envConfig.paymentQrUrl}
                          alt="QR de pago"
                          width={180}
                          height={180}
                          className="rounded-xl"
                          unoptimized
                        />
                      ) : (
                        <div className="border-border flex h-44 w-44 items-center justify-center rounded-xl border-2 border-dashed">
                          <p className="text-text-muted px-3 text-center text-xs">
                            Agregá tu QR en NEXT_PUBLIC_PAYMENT_QR_URL
                          </p>
                        </div>
                      )}
                      <p className="text-text-muted text-center text-xs">
                        Escaneá y enviá el comprobante por WhatsApp.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={() => setStep(1)}
                    leftIcon={<ChevronLeft size={18} />}
                  >
                    Atrás
                  </Button>
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
              </section>
            )}
          </div>

          {/* Sidebar resumen — sticky */}
          <div className="lg:sticky lg:top-20">{OrderSidebar}</div>
        </div>
      </form>
    </div>
  );
}
