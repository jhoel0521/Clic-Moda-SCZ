'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, MapPin } from 'lucide-react';
import { OrderService } from '@src/services/OrderService';
import { Spinner } from '@src/shared/ui/Spinner';
import { ROUTES } from '@src/routes';
import { whatsappHref } from '@src/core/config/env.config';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '@src/core/constants/ORDER_STATUS';
import { buildOrderWhatsappMessage } from '@src/shared/utils/orderMessage';
import type { IOrder } from '@src/core/models';

export function OrderDetailPage() {
  const orderId = useSearchParams().get('id') ?? '';
  const [order, setOrder] = useState<IOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void OrderService.getOrderById(orderId)
      .then(setOrder)
      .finally(() => setIsLoading(false));
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="px-6 py-20 text-center">
        <h1 className="text-text-primary mb-3 text-2xl font-bold">Pedido no encontrado</h1>
        <Link href={ROUTES.CATALOG} className="font-bold text-pink-600">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const isPending = order.status === ORDER_STATUS.PROCESADO;
  const { fullName, phone, address, city, reference } = order.shippingAddress;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-5 md:py-12">
      {/* Ticket y paso final */}
      <section className="rounded-2xl border border-gray-100 bg-white p-5 text-center shadow-sm">
        <p className="text-brand text-xs font-semibold tracking-widest uppercase">Tu ticket</p>
        <p className="text-brand my-1 font-mono text-3xl font-bold">{order.ticketId}</p>
        <p className="text-text-muted mb-4 text-sm">Estado: {ORDER_STATUS_LABELS[order.status]}</p>

        {isPending && (
          <>
            <h1 className="text-text-primary mb-1 text-xl font-black">
              Falta un paso: envianos tu pedido
            </h1>
            <p className="text-text-secondary mb-4 text-sm">
              Por WhatsApp confirmamos la disponibilidad, te pasamos los datos para pagar y
              coordinamos la entrega.
            </p>
          </>
        )}

        <a
          href={whatsappHref(buildOrderWhatsappMessage(order))}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-14 items-center justify-center gap-2 rounded-xl bg-[#25D366] text-[15px] font-bold whitespace-nowrap text-white active:opacity-80"
        >
          <MessageCircle size={22} />
          {isPending ? 'Enviar pedido por WhatsApp' : 'Consultar por WhatsApp'}
        </a>
      </section>

      {/* Productos */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <h2 className="text-text-primary mb-3 font-bold">Productos</h2>
        <ul className="space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {item.product.images[0] && (
                  <Image
                    src={item.product.images[0].url}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="text-text-primary font-semibold">{item.product.name}</p>
                <p className="text-text-muted text-xs">
                  Talla {item.selectedSize} · {item.selectedColor} · {item.quantity} u.
                </p>
              </div>
              <p className="text-text-primary text-sm font-semibold whitespace-nowrap">
                Bs. {(item.unitPrice * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
        <div className="border-border mt-3 space-y-1.5 border-t pt-3 text-sm">
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Descuento{order.couponCode ? ` (${order.couponCode})` : ''}</span>
              <span className="whitespace-nowrap">−Bs. {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="text-text-secondary flex justify-between">
            <span>Envío</span>
            <span>Por cobrar</span>
          </div>
          <div className="text-text-primary flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="whitespace-nowrap">Bs. {order.total.toFixed(2)}</span>
          </div>
        </div>
      </section>

      {/* Entrega */}
      <section className="rounded-2xl border border-gray-100 bg-white p-4 text-sm shadow-sm">
        <h2 className="text-text-primary mb-2 flex items-center gap-2 font-bold">
          <MapPin size={16} className="text-brand" />
          Entrega
        </h2>
        <p className="text-text-primary font-medium">{fullName}</p>
        <p className="text-text-secondary">{phone}</p>
        <p className="text-text-secondary">
          {address}, {city}
        </p>
        {reference && <p className="text-text-muted text-xs">Referencia: {reference}</p>}
      </section>

      <Link
        href={ROUTES.CATALOG}
        className="flex h-12 items-center justify-center text-sm font-bold text-pink-600"
      >
        Seguir comprando
      </Link>
    </div>
  );
}
