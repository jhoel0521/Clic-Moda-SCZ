import { useEffect, useState } from 'react';
import { api } from '../lib/client-api';
import { KIND_LABELS, type MovementItem } from '../lib/stock';
import { errorMessage, type Page } from '../lib/types';

const dateTime = new Intl.DateTimeFormat('es-BO', { dateStyle: 'short', timeStyle: 'short' });

function Movement({ item }: { item: MovementItem }) {
  const up = item.delta > 0;
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="font-medium">{KIND_LABELS[item.type]}</p>
        <p className="text-muted truncate text-sm">
          {item.reason} · {dateTime.format(new Date(item.occurredAt))}
        </p>
      </div>
      <span className={`shrink-0 text-lg font-bold ${up ? 'text-success' : 'text-danger'}`}>
        {up ? '+' : ''}
        {item.delta}
      </span>
    </li>
  );
}

// Últimos movimientos de una variante (se cargan al abrir el historial).
export default function MovementsPanel({ variantId }: { variantId: string }) {
  const [items, setItems] = useState<MovementItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<Page<MovementItem>>('GET', `inventory/variants/${variantId}/movements?pageSize=10`).then(
      (page) => setItems(page.items),
      (failure) => setError(errorMessage(failure))
    );
  }, [variantId]);
  if (error) return <p className="text-danger">{error}</p>;
  if (items === null) return <p className="text-muted">Cargando historial…</p>;
  if (items.length === 0) return <p className="text-muted">Todavía no hay movimientos.</p>;
  return (
    <ul className="divide-line divide-y">
      {items.map((item) => (
        <Movement key={item.id} item={item} />
      ))}
    </ul>
  );
}
