'use client';

import { AlertTriangle } from 'lucide-react';

export function StockAlertFeed() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-warning" />
        <h3 className="font-bold text-sm text-text-primary">Alertas de Stock</h3>
      </div>
      
      <p className="text-sm text-text-muted py-4 text-center">
        El sistema de alertas en tiempo real está desactivado temporalmente.
      </p>
    </div>
  );
}
