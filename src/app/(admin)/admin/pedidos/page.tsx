'use client';

import { useEffect, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { OrderService } from '@src/services/OrderService';
import { AdminHeader } from '@src/app/(admin)/AdminHeader';
import { Spinner } from '@src/shared/ui/Spinner';
import { getNextOrderStatus, ORDER_STATUS_LABELS, type OrderStatus } from '@src/core/constants/ORDER_STATUS';
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
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Gestión de Pedidos" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{orders.length} pedidos totales</p>
        <div className="flex gap-1 rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={['flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all', viewMode === 'list' ? 'bg-brand-subtle text-brand' : 'text-text-muted hover:text-text-primary'].join(' ')}
          >
            <List size={14} /> Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={['flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all', viewMode === 'kanban' ? 'bg-brand-subtle text-brand' : 'text-text-muted hover:text-text-primary'].join(' ')}
          >
            <LayoutGrid size={14} /> Kanban
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : viewMode === 'kanban' ? (
        <OrderKanbanBoard orders={orders} onAdvance={handleAdvance} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-text-muted">
              <p className="text-4xl mb-3">📦</p>
              <p>Aún no hay pedidos registrados.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-secondary border-b border-border">
                  <th className="px-5 py-3 text-left font-semibold text-text-primary">Ticket</th>
                  <th className="hidden md:table-cell px-5 py-3 text-left font-semibold text-text-primary">Cliente</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left font-semibold text-text-primary">Fecha</th>
                  <th className="px-5 py-3 text-right font-semibold text-text-primary">Total</th>
                  <th className="px-5 py-3 text-center font-semibold text-text-primary">Estado</th>
                  <th className="px-5 py-3 text-center font-semibold text-text-primary">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-white">
                {orders.map((order) => {
                  const next = getNextOrderStatus(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-surface-hover">
                      <td className="px-5 py-3 font-mono font-bold text-brand">{order.ticketId}</td>
                      <td className="hidden md:table-cell px-5 py-3 text-text-secondary">{order.shippingAddress.fullName}</td>
                      <td className="hidden sm:table-cell px-5 py-3 text-text-muted">
                        {new Date(order.createdAt).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-text-primary">
                        Bs. {order.total.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {next ? (
                          <button
                            type="button"
                            onClick={() => handleAdvance(order.id)}
                            className="rounded-lg bg-brand-subtle px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                          >
                            → {ORDER_STATUS_LABELS[next]}
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted">Finalizado</span>
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
