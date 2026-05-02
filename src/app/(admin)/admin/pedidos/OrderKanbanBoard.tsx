'use client';

import { ORDER_STATUS_SEQUENCE, ORDER_STATUS_LABELS } from '@src/core/constants/ORDER_STATUS';
import type { IOrder } from '@src/core/models';

interface OrderKanbanBoardProps {
  orders: IOrder[];
  onAdvance: (orderId: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  PROCESADO: 'border-blue-200 bg-blue-50',
  EN_PREPARACION: 'border-yellow-200 bg-yellow-50',
  LISTO_PARA_RECOGER: 'border-purple-200 bg-purple-50',
  ENVIANDO: 'border-orange-200 bg-orange-50',
  ENTREGADO: 'border-green-200 bg-green-50',
};

const HEADER_COLORS: Record<string, string> = {
  PROCESADO: 'bg-blue-100 text-blue-800',
  EN_PREPARACION: 'bg-yellow-100 text-yellow-800',
  LISTO_PARA_RECOGER: 'bg-purple-100 text-purple-800',
  ENVIANDO: 'bg-orange-100 text-orange-800',
  ENTREGADO: 'bg-green-100 text-green-800',
};

export function OrderKanbanBoard({ orders, onAdvance }: OrderKanbanBoardProps) {
  const byStatus = ORDER_STATUS_SEQUENCE.map((status) => ({
    status,
    orders: orders.filter((o) => o.status === status),
  }));

  const isLast = (status: string) => status === ORDER_STATUS_SEQUENCE[ORDER_STATUS_SEQUENCE.length - 1];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {byStatus.map(({ status, orders: columnOrders }) => (
        <div key={status} className="shrink-0 w-56">
          <div className={`rounded-t-xl px-3 py-2 text-xs font-bold uppercase tracking-wide ${HEADER_COLORS[status]}`}>
            {ORDER_STATUS_LABELS[status]} ({columnOrders.length})
          </div>
          <div className={`min-h-32 rounded-b-xl border-x border-b p-2 space-y-2 ${STATUS_COLORS[status]}`}>
            {columnOrders.map((order) => (
              <div key={order.id} className="rounded-lg bg-white border border-white/80 p-3 shadow-sm text-xs space-y-1.5">
                <p className="font-mono font-bold text-brand">{order.ticketId}</p>
                <p className="text-text-muted truncate">{order.shippingAddress.fullName}</p>
                <p className="font-semibold text-text-primary">Bs. {order.total.toFixed(0)}</p>
                {!isLast(status) && (
                  <button
                    type="button"
                    onClick={() => onAdvance(order.id)}
                    className="w-full rounded-lg bg-brand-subtle py-1 text-[10px] font-bold text-brand hover:bg-brand hover:text-white transition-colors"
                  >
                    Avanzar →
                  </button>
                )}
              </div>
            ))}
            {columnOrders.length === 0 && (
              <p className="text-center text-text-muted text-xs py-4">Vacío</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
