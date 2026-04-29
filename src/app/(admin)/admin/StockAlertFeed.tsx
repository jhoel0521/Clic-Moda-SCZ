'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { mockSocket, type MockSocketEvent } from '@src/mocks/MockSocket';

type StockAlert = Extract<MockSocketEvent, { type: 'STOCK_LOW' }>;

export function StockAlertFeed() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);

  useEffect(() => {
    const unsub = mockSocket.on((event) => {
      if (event.type === 'STOCK_LOW') {
        setAlerts((prev) => [event, ...prev].slice(0, 5));
      }
    });
    mockSocket.connect();
    return () => {
      unsub();
      mockSocket.disconnect();
    };
  }, []);

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-[var(--color-warning)]" />
        <h3 className="font-bold text-sm text-[var(--color-text-primary)]">Alertas de Stock</h3>
        <span className="ml-auto text-xs text-[var(--color-text-muted)]">Tiempo real</span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">
          Sin alertas. Los avisos aparecerán aquí cada 15 s.
        </p>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={`${alert.product.id}-${i}`}
              className="flex items-center justify-between rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-sm"
            >
              <span className="font-medium text-amber-800 line-clamp-1">{alert.product.name}</span>
              <span className="ml-2 shrink-0 font-bold text-amber-700">{alert.product.stock} und.</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
