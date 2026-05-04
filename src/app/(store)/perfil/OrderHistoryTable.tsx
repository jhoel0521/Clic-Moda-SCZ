'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { ORDER_STATUS_LABELS, type OrderStatus } from '@src/core/constants/ORDER_STATUS';
import { ROUTES } from '@src/routes';
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
      <div className="border-border bg-surface rounded-2xl border px-6 py-12 text-center shadow-sm">
        <p className="mb-3 text-4xl">📦</p>
        <p className="text-text-primary mb-1 font-semibold">Aún no tenés pedidos</p>
        <p className="text-text-muted text-sm">
          Cuando realices una compra, aparecerá acá tu historial.
        </p>
      </div>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-2xl border shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-secondary border-border border-b">
            <th className="text-text-primary px-5 py-3 text-left font-semibold">Ticket</th>
            <th className="text-text-primary hidden px-5 py-3 text-left font-semibold sm:table-cell">
              Fecha
            </th>
            <th className="text-text-primary px-5 py-3 text-left font-semibold">Total</th>
            <th className="text-text-primary px-5 py-3 text-left font-semibold">Estado</th>
            <th className="text-text-primary px-5 py-3 text-left font-semibold">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y bg-white">
          {orders.map((order) => {
            const waMsg = encodeURIComponent(`Hola! Consulto por mi pedido *${order.ticketId}*`);
            return (
              <tr key={order.id} className="hover:bg-surface-hover">
                <td className="px-5 py-4">
                  <Link
                    href={ROUTES.ORDER_DETAIL(order.id)}
                    className="text-brand font-mono font-bold hover:underline"
                  >
                    {order.ticketId}
                  </Link>
                </td>
                <td className="text-text-muted hidden px-5 py-4 sm:table-cell">
                  {new Date(order.createdAt).toLocaleDateString('es-BO')}
                </td>
                <td className="text-text-primary px-5 py-4 font-semibold">
                  Bs. {order.total.toFixed(2)}
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                  >
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
