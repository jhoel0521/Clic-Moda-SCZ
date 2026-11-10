'use client';

import { AlertTriangle } from 'lucide-react';

export function StockAlertFeed() {
  return (
    <div className="border-border bg-surface rounded-2xl border p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={16} className="text-warning" />
        <h3 className="text-text-primary text-sm font-bold">Alertas de Stock</h3>
      </div>

      <p className="text-text-muted py-4 text-center text-sm">
        El sistema de alertas en tiempo real está desactivado temporalmente.
      </p>
    </div>
  );
}
