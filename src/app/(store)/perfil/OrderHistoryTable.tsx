'use client';

import { MessageCircle } from 'lucide-react';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@src/core/constants/ORDER_STATUS';
import type { IOrder } from '@src/core/models';

const WA_NUMBER = '59177000001';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PROCESADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_PREPARACION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LISTO_PARA_RECOGER: 'bg-purple-50 text-purple-700 border-purple-200',
  ENVIANDO: 'bg-orange-50 text-orange-700 border-orange-200',
  ENTREGADO: 'bg-green-50 text-green-700 border-green-200',
};

interface OrderHistoryTableProps {
  orders: IOrder[];
}

export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12 text-center shadow-[var(--shadow-sm)]">
        <p className="text-4xl mb-3">📦</p>
        <p className="font-semibold text-[var(--color-text-primary)] mb-1">Aún no tenés pedidos</p>
        <p className="text-sm text-[var(--color-text-muted)]">
          Cuando realices una compra, aparecerá acá tu historial.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
            <th className="px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Ticket</th>
            <th className="hidden sm:table-cell px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Fecha</th>
            <th className="px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Total</th>
            <th className="px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Estado</th>
            <th className="px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] bg-white">
          {orders.map((order) => {
            const waMsg = encodeURIComponent(`Hola! Consulto por mi pedido *${order.ticketId}*`);
            return (
              <tr key={order.id} className="hover:bg-[var(--color-surface-hover)]">
                <td className="px-5 py-4 font-mono font-bold text-[var(--color-brand)]">{order.ticketId}</td>
                <td className="hidden sm:table-cell px-5 py-4 text-[var(--color-text-muted)]">
                  {new Date(order.createdAt).toLocaleDateString('es-BO')}
                </td>
                <td className="px-5 py-4 font-semibold text-[var(--color-text-primary)]">
                  Bs. {order.total.toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <a
                    href={`https://wa.me/${WA_NUMBER}?text=${waMsg}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 hover:underline"
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
