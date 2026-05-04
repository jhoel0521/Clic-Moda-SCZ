'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Download, MapPin, CreditCard, Package } from 'lucide-react';
import { OrderService } from '@src/services/OrderService';
import { Button } from '@src/shared/ui/Button';
import { Spinner } from '@src/shared/ui/Spinner';
import { ROUTES } from '@src/routes';
import { envConfig } from '@src/core/config/env.config';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@src/core/constants/ORDER_STATUS';
import type { IOrder } from '@src/core/models';

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: 'Transferencia bancaria',
  qr_simple: 'QR Simple',
  efectivo_entrega: 'Efectivo en entrega',
  contra_entrega: 'Contra entrega',
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PROCESADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_PREPARACION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LISTO_PARA_RECOGER: 'bg-purple-50 text-purple-700 border-purple-200',
  ENVIANDO: 'bg-orange-50 text-orange-700 border-orange-200',
  ENTREGADO: 'bg-green-50 text-green-700 border-green-200',
};

function PaymentInfoBlock({ method }: { method: string }) {
  if (method === 'transferencia') {
    return (
      <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-bg-secondary border-border border-b px-5 py-4">
          <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
            <span>🏦</span> Datos para transferencia bancaria
          </p>
        </div>
        <div className="divide-border divide-y">
          <Row label="Banco" value={envConfig.bank.name} />
          <Row label="N° de cuenta" value={envConfig.bank.account} mono />
          <Row label="Titular" value={envConfig.bank.holder} />
          <Row label="CI / NIT" value={envConfig.bank.ci} mono />
        </div>
        <p className="text-text-muted px-5 py-3 text-xs">
          Enviá el comprobante por WhatsApp con tu número de ticket.
        </p>
      </div>
    );
  }

  if (method === 'qr_simple') {
    return (
      <div className="border-border bg-surface overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-bg-secondary border-border border-b px-5 py-4">
          <p className="text-text-primary flex items-center gap-2 text-sm font-semibold">
            <span>📱</span> Código QR para pago
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 px-5 py-6">
          {envConfig.paymentQrUrl ? (
            <Image
              src={envConfig.paymentQrUrl}
              alt="QR de pago"
              width={200}
              height={200}
              className="rounded-xl"
              unoptimized
            />
          ) : (
            <div className="border-border flex h-48 w-48 items-center justify-center rounded-xl border-2 border-dashed">
              <p className="text-text-muted px-4 text-center text-xs">
                QR no configurado. Agregá NEXT_PUBLIC_PAYMENT_QR_URL en .env.local
              </p>
            </div>
          )}
          <p className="text-text-muted text-center text-xs">
            Escaneá con tu app bancaria y enviá el comprobante por WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className={`text-text-primary font-semibold ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<IOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    OrderService.getOrderById(params.id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setOrder(data);
      })
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="md" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="mb-4 text-4xl">❓</p>
        <h1 className="text-text-primary mb-3 text-2xl font-bold">Pedido no encontrado</h1>
        <p className="text-text-muted mb-8">No encontramos ningún pedido con ese identificador.</p>
        <Link href={ROUTES.CATALOG}>
          <Button variant="primary">Ver catálogo</Button>
        </Link>
      </div>
    );
  }

  const waMsg = encodeURIComponent(
    `Hola! Quiero coordinar mi pedido *${order.ticketId}*.\nTotal: Bs. ${order.total.toFixed(2)}\nMétodo de pago: ${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}`
  );

  function downloadTicket() {
    const lines = [
      `CLIC MODA SCZ — COMPROBANTE DE PEDIDO`,
      `═══════════════════════════════════`,
      `Ticket: ${order!.ticketId}`,
      `Fecha: ${new Date(order!.createdAt).toLocaleString('es-BO')}`,
      `Estado: ${ORDER_STATUS_LABELS[order!.status]}`,
      ``,
      `PRODUCTOS:`,
      ...order!.items.map(
        (i) =>
          `  • ${i.product.name} (${i.selectedSize} / ${i.selectedColor}) x${i.quantity}  Bs. ${(i.unitPrice * i.quantity).toFixed(2)}`
      ),
      ``,
      `Subtotal:  Bs. ${order!.subtotal.toFixed(2)}`,
      order!.discount > 0 ? `Descuento: -Bs. ${order!.discount.toFixed(2)}` : '',
      `Envío:     Por cobrar`,
      `TOTAL:     Bs. ${order!.total.toFixed(2)}`,
      ``,
      `Método de pago: ${PAYMENT_LABELS[order!.paymentMethod] ?? order!.paymentMethod}`,
      ``,
      `DIRECCIÓN DE ENTREGA:`,
      `  ${order!.shippingAddress.fullName}`,
      `  ${order!.shippingAddress.address}, ${order!.shippingAddress.city}`,
      order!.shippingAddress.reference ? `  Ref: ${order!.shippingAddress.reference}` : '',
      ``,
      `Gracias por tu compra! Coordinamos la entrega por WhatsApp.`,
    ].filter(Boolean);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${order!.ticketId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 sm:px-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <p className="mb-2 text-4xl">✅</p>
        <h1 className="text-text-primary text-2xl font-bold">Pedido confirmado</h1>
        <p className="text-text-muted mt-1 text-sm">
          Coordiná la entrega enviando tu ticket por WhatsApp.
        </p>
      </div>

      {/* Ticket */}
      <div className="border-brand bg-brand-subtle mb-6 rounded-2xl border-2 border-dashed p-6 text-center">
        <p className="text-brand mb-1 text-xs font-semibold tracking-widest uppercase">Tu ticket</p>
        <p className="text-brand font-mono text-3xl font-bold tracking-wider">{order.ticketId}</p>
        <div className="mt-2 flex items-center justify-center gap-3">
          <p className="text-text-muted text-xs">
            {new Date(order.createdAt).toLocaleString('es-BO')}
          </p>
          <span
            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
          >
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {/* Info de pago */}
      {(order.paymentMethod === 'transferencia' || order.paymentMethod === 'qr_simple') && (
        <div className="mb-6">
          <PaymentInfoBlock method={order.paymentMethod} />
        </div>
      )}

      {/* Productos */}
      <div className="border-border bg-surface mb-6 overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-bg-secondary border-border flex items-center gap-2 border-b px-5 py-4">
          <Package size={15} className="text-brand" />
          <p className="text-text-primary text-sm font-semibold">Productos</p>
        </div>
        <div className="divide-border divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="text-text-primary font-medium">{item.product.name}</p>
                <p className="text-text-muted text-xs">
                  {item.selectedSize} / {item.selectedColor} × {item.quantity}
                </p>
              </div>
              <p className="text-text-primary font-bold">
                Bs. {(item.unitPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="bg-bg-secondary border-border space-y-2 border-t px-5 py-4 text-sm">
          <div className="text-text-secondary flex justify-between">
            <span>Subtotal</span>
            <span>Bs. {order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Descuento</span>
              <span>−Bs. {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5">
            <span className="font-medium text-amber-700">Envío</span>
            <span className="font-bold text-amber-700">Por cobrar</span>
          </div>
          <div className="text-text-primary border-border flex justify-between border-t pt-2 text-base font-bold">
            <span>Total</span>
            <span>Bs. {order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Método de pago + Dirección */}
      <div className="border-border bg-surface mb-6 overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-bg-secondary border-border flex items-center gap-2 border-b px-5 py-4">
          <CreditCard size={15} className="text-brand" />
          <p className="text-text-primary text-sm font-semibold">Método de pago</p>
        </div>
        <div className="px-5 py-3 text-sm">
          <p className="text-text-primary font-medium">
            {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
          </p>
        </div>

        <div className="bg-bg-secondary border-border flex items-center gap-2 border-t border-b px-5 py-4">
          <MapPin size={15} className="text-brand" />
          <p className="text-text-primary text-sm font-semibold">Dirección de entrega</p>
        </div>
        <div className="space-y-0.5 px-5 py-3 text-sm">
          <p className="text-text-primary font-medium">{order.shippingAddress.fullName}</p>
          <p className="text-text-secondary">{order.shippingAddress.address}</p>
          <p className="text-text-secondary">{order.shippingAddress.city}</p>
          {order.shippingAddress.reference && (
            <p className="text-text-muted text-xs">Ref: {order.shippingAddress.reference}</p>
          )}
          {order.shippingAddress.phone && (
            <p className="text-text-muted text-xs">Tel: {order.shippingAddress.phone}</p>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`https://wa.me/${envConfig.whatsappNumber}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="primary" size="lg" fullWidth leftIcon={<MessageCircle size={18} />}>
            Coordinar por WhatsApp
          </Button>
        </a>
        <Button
          variant="secondary"
          size="lg"
          onClick={downloadTicket}
          leftIcon={<Download size={18} />}
        >
          Descargar ticket
        </Button>
      </div>

      <div className="mt-8 text-center">
        <Link href={ROUTES.CATALOG} className="text-brand text-sm font-medium hover:underline">
          Seguir comprando →
        </Link>
      </div>
    </div>
  );
}
