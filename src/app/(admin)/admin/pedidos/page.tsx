'use client';

import { useEffect, useState } from 'react';
import { List, LayoutGrid } from 'lucide-react';
import { MockOrderService } from '@src/mocks/services/MockOrderService';
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
    MockOrderService.getOrders()
      .then((data) => setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleAdvance(orderId: string) {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;
    const nextStatus = getNextOrderStatus(order.status);
    if (!nextStatus) return;
    const updated = await MockOrderService.updateOrderStatus(orderId, nextStatus);
    if (updated) {
      setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o));
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Gestión de Pedidos" />

      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">{orders.length} pedidos totales</p>
        <div className="flex gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={['flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all', viewMode === 'list' ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'].join(' ')}
          >
            <List size={14} /> Lista
          </button>
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={['flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all', viewMode === 'kanban' ? 'bg-[var(--color-brand-subtle)] text-[var(--color-brand)]' : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'].join(' ')}
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
        <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
          {orders.length === 0 ? (
            <div className="py-16 text-center text-[var(--color-text-muted)]">
              <p className="text-4xl mb-3">📦</p>
              <p>Aún no hay pedidos registrados.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
                  <th className="px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Ticket</th>
                  <th className="hidden md:table-cell px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Cliente</th>
                  <th className="hidden sm:table-cell px-5 py-3 text-left font-semibold text-[var(--color-text-primary)]">Fecha</th>
                  <th className="px-5 py-3 text-right font-semibold text-[var(--color-text-primary)]">Total</th>
                  <th className="px-5 py-3 text-center font-semibold text-[var(--color-text-primary)]">Estado</th>
                  <th className="px-5 py-3 text-center font-semibold text-[var(--color-text-primary)]">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)] bg-white">
                {orders.map((order) => {
                  const next = getNextOrderStatus(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-[var(--color-surface-hover)]">
                      <td className="px-5 py-3 font-mono font-bold text-[var(--color-brand)]">{order.ticketId}</td>
                      <td className="hidden md:table-cell px-5 py-3 text-[var(--color-text-secondary)]">{order.shippingAddress.fullName}</td>
                      <td className="hidden sm:table-cell px-5 py-3 text-[var(--color-text-muted)]">
                        {new Date(order.createdAt).toLocaleDateString('es-BO')}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[var(--color-text-primary)]">
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
                            className="rounded-lg bg-[var(--color-brand-subtle)] px-3 py-1.5 text-xs font-bold text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-colors"
                          >
                            → {ORDER_STATUS_LABELS[next]}
                          </button>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">Finalizado</span>
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
