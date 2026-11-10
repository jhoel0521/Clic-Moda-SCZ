'use client';

import { useEffect, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { OrderService } from '@src/services/OrderService';
import { AdminHeader } from '@src/app/(admin)/AdminHeader';
import { Spinner } from '@src/shared/ui/Spinner';
import {
  getNextOrderStatus,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from '@src/core/constants/ORDER_STATUS';
import { OrderKanbanBoard } from './OrderKanbanBoard';
import type { IOrder } from '@src/core/models';

const STATUS_STYLES: Record<OrderStatus, string> = {
  PROCESADO: 'bg-blue-50 text-blue-700 border-blue-200',
  EN_PREPARACION: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  LISTO_PARA_RECOGER: 'bg-purple-50 text-purple-700 border-purple-200',
  ENVIANDO: 'bg-orange-50 text-orange-700 border-orange-200',
  ENTREGADO: 'bg-green-50 text-green-700 border-green-200',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  useEffect(() => {
    OrderService.getOrders()
      .then((data) => setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleAdvance(orderId: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) return;
    const updated = await OrderService.updateOrderStatus(orderId, nextStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Gestión de Pedidos" />

      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">{orders.length} pedidos totales</p>
        <div className="border-border bg-surface flex gap-1 rounded-xl border p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              viewMode === 'list'
                ? 'bg-brand-subtle text-brand'
                : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            <List size={14} /> Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={[
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
              viewMode === 'kanban'
                ? 'bg-brand-subtle text-brand'
                : 'text-text-muted hover:text-text-primary',
            ].join(' ')}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : viewMode === 'kanban' ? (
        <OrderKanbanBoard orders={orders} onAdvance={handleAdvance} />
      ) : (
        <div className="border-border overflow-hidden rounded-2xl border shadow-sm">
          {orders.length === 0 ? (
            <div className="text-text-muted py-16 text-center">
              <p className="mb-3 text-4xl">📦</p>
              <p>Aún no hay pedidos registrados.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary border-border border-b">
                  <th className="text-text-primary px-5 py-3 text-left font-semibold">Ticket</th>
                  <th className="text-text-primary hidden px-5 py-3 text-left font-semibold md:table-cell">
                    Cliente
                  </th>
                  <th className="text-text-primary hidden px-5 py-3 text-left font-semibold sm:table-cell">
                    Fecha
                  </th>
                  <th className="text-text-primary px-5 py-3 text-right font-semibold">Total</th>
                  <th className="text-text-primary px-5 py-3 text-center font-semibold">Estado</th>
                  <th className="text-text-primary px-5 py-3 text-center font-semibold">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y bg-white">
                {orders.map((order) => {
                  const next = getNextOrderStatus(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-surface-hover">
                      <td className="text-brand px-5 py-3 font-mono font-bold">{order.ticketId}</td>
                      <td className="text-text-secondary hidden px-5 py-3 md:table-cell">
                        {order.shippingAddress.fullName}
                      </td>
                      <td className="text-text-muted hidden px-5 py-3 sm:table-cell">
                        {new Date(order.createdAt).toLocaleDateString('es-BO')}
                      </td>
                      <td className="text-text-primary px-5 py-3 text-right font-semibold">
                        Bs. {order.total.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {next ? (
                          <button
                            type="button"
                            onClick={() => handleAdvance(order.id)}
                            className="bg-brand-subtle text-brand hover:bg-brand rounded-lg px-3 py-1.5 text-xs font-bold transition-colors hover:text-white"
                          >
                            → {ORDER_STATUS_LABELS[next]}
                          </button>
                        ) : (
                          <span className="text-text-muted text-xs">Finalizado</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
