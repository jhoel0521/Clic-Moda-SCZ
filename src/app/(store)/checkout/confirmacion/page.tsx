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
  transferencia:    'Transferencia bancaria',
  qr_simple:        'QR Simple',
  efectivo_entrega: 'Efectivo en entrega',
  contra_entrega:   'Contra entrega',
};

export default function ConfirmationPage() {
  const storeOrder = useCheckoutStore((s) => s.lastOrder);
  const [order, setOrder] = useState<IOrder | null>(storeOrder);

  /* Persistir en localStorage al llegar con pedido; recuperar si se recarga */
  useEffect(() => {
    if (storeOrder) {
      localStorage.setItem(LS_KEY, JSON.stringify(storeOrder));
      setOrder(storeOrder);
    } else {
      try {
        const saved = localStorage.getItem(LS_KEY);
        if (saved) setOrder(JSON.parse(saved) as IOrder);
      } catch {
        /* ignore parse errors */
      }
    }
  }, [storeOrder]);

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="text-4xl mb-4">❓</p>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-3">No hay pedido activo</h1>
        <p className="text-[var(--color-text-muted)] mb-8">
          Para generar un ticket de pedido primero completá el proceso de compra.
        </p>
        <Link href={ROUTES.CATALOG}>
          <Button variant="primary">Ver catálogo</Button>
        </Link>
      </div>
    );
  }

  const waMsg = encodeURIComponent(
    `Hola! Quiero coordinar mi pedido *${order.ticketId}*.\nTotal: Bs. ${order.total.toFixed(2)}\nMétodo de pago: ${PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}`,
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
        (i) => `  • ${i.product.name} (${i.selectedSize} / ${i.selectedColor}) x${i.quantity}  Bs. ${(i.unitPrice * i.quantity).toFixed(2)}`,
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
    <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 py-14">
      <SuccessState
        title="¡Pedido confirmado!"
        description="Coordiná la entrega enviando tu ticket por WhatsApp."
      />

      {/* Ticket */}
      <div className="mb-6 rounded-2xl border-2 border-dashed border-[var(--color-border-brand)] bg-[var(--color-brand-subtle)] p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-brand)] mb-1">
          Tu ticket
        </p>
        <p className="font-mono text-3xl font-bold text-[var(--color-brand)] tracking-wider">
          {order.ticketId}
        </p>
        <p className="mt-1 text-xs text-[var(--color-text-muted)]">
          {new Date(order.createdAt).toLocaleString('es-BO')}
        </p>
      </div>

      {/* Ítems del pedido */}
      <div className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-5 py-4 bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
          <p className="font-semibold text-sm text-[var(--color-text-primary)]">Productos</p>
        </div>
        <div className="divide-y divide-[var(--color-border)]">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium text-[var(--color-text-primary)]">{item.product.name}</p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {item.selectedSize} / {item.selectedColor} × {item.quantity}
                </p>
              </div>
              <p className="font-bold text-[var(--color-text-primary)]">
                Bs. {(item.unitPrice * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        {/* Totales */}
        <div className="px-5 py-4 bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)] space-y-2 text-sm">
          <div className="flex justify-between text-[var(--color-text-secondary)]">
            <span>Subtotal</span>
            <span>Bs. {order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Descuento</span>
              <span>−Bs. {order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between items-center rounded-lg bg-amber-50 px-3 py-1.5 border border-amber-200">
            <span className="text-amber-700 font-medium">Envío</span>
            <span className="font-bold text-amber-700">Por cobrar</span>
          </div>
          <div className="flex justify-between font-bold text-base text-[var(--color-text-primary)] border-t border-[var(--color-border)] pt-2">
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
        <Link href={ROUTES.CATALOG} className="text-sm text-[var(--color-brand)] font-medium hover:underline">
          Seguir comprando →
        </Link>
      </div>
    </div>
  );
}
