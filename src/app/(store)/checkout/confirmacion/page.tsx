'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageCircle, Download } from 'lucide-react';
import { useCheckoutStore } from '@src/core/store/useCheckoutStore';
import { Button } from '@src/shared/ui/Button';
import { SuccessState } from '@src/shared/ui/feedback/SuccessState';
import { ROUTES } from '@src/routes';
import type { IOrder } from '@src/core/models';

const LS_KEY = 'clic-moda-last-order';
const WA_NUMBER = '59177000001';

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: 'Transferencia bancaria',
  qr_simple: 'QR Simple',
  efectivo_entrega: 'Efectivo en entrega',
  contra_entrega: 'Contra entrega',
};

export default function ConfirmationPage() {
  const storeOrder = useCheckoutStore((s) => s.lastOrder);
  const [cachedOrder] = useState<IOrder | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? (JSON.parse(saved) as IOrder) : null;
    } catch {
      return null;
    }
  });
  const order = storeOrder ?? cachedOrder;

  /* Persistir en localStorage al llegar con pedido */
  useEffect(() => {
    if (storeOrder) {
      localStorage.setItem(LS_KEY, JSON.stringify(storeOrder));
    }
  }, [storeOrder]);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="mb-4 text-4xl">❓</p>
        <h1 className="text-text-primary mb-3 text-2xl font-bold">No hay pedido activo</h1>
        <p className="text-text-muted mb-8">
          Para generar un ticket de pedido primero completá el proceso de compra.
        </p>
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
      <SuccessState
        title="¡Pedido confirmado!"
        description="Coordiná la entrega enviando tu ticket por WhatsApp."
      />

      {/* Ticket */}
      <div className="border-border-brand bg-brand-subtle mb-6 rounded-2xl border-2 border-dashed p-6 text-center">
        <p className="text-brand mb-1 text-xs font-semibold tracking-widest uppercase">Tu ticket</p>
        <p className="text-brand font-mono text-3xl font-bold tracking-wider">{order.ticketId}</p>
        <p className="text-text-muted mt-1 text-xs">
          {new Date(order.createdAt).toLocaleString('es-BO')}
        </p>
      </div>

      {/* Ítems del pedido */}
      <div className="border-border bg-surface mb-6 overflow-hidden rounded-2xl border shadow-sm">
        <div className="bg-bg-secondary border-border border-b px-5 py-4">
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

      {/* Acciones — WhatsApp primero (Peak-End Rule) */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
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
