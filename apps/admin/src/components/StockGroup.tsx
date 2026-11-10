import { useState } from 'react';
import type { MovementKind, StockRow } from '../lib/stock';
import MovementsPanel from './MovementsPanel';
import { Badge, Button, Card, Switch } from './ui';

export interface RowActions {
  canWrite: boolean;
  canDeactivate: boolean;
  onAction: (row: StockRow, kind: MovementKind) => void;
  onToggle: (row: StockRow) => void;
}

// Las variantes llegan ordenadas por producto: se agrupan para ver cada producto una sola vez.
export function groupByProduct(rows: StockRow[]): { name: string; rows: StockRow[] }[] {
  const groups: { name: string; rows: StockRow[] }[] = [];
  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (last && last.name === row.productName) last.rows.push(row);
    else groups.push({ name: row.productName, rows: [row] });
  }
  return groups;
}

function Status({ row }: { row: StockRow }) {
  if (!row.active) return <Badge tone="neutral">Inactiva</Badge>;
  if (row.available <= 0) return <Badge tone="warning">Agotada</Badge>;
  return row.available <= row.reorderLevel ? <Badge tone="warning">Stock bajo</Badge> : null;
}

function VariantHead({ row }: { row: StockRow }) {
  const label = [`Talla ${row.size}`, row.color].filter(Boolean).join(' · ');
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">{label}</p>
      <p className="text-muted truncate text-sm">
        {row.sku} · {row.location ?? 'Sin ubicación'}
      </p>
    </div>
  );
}

function Available({ row }: { row: StockRow }) {
  const low = row.active && row.available <= row.reorderLevel;
  return (
    <div className="flex flex-col items-end gap-1">
      <p className={`text-2xl leading-none font-bold ${low ? 'text-warning' : ''}`}>{row.available}</p>
      <Status row={row} />
    </div>
  );
}

function Actions({ row, onAction }: Pick<RowActions, 'onAction'> & { row: StockRow }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button className="px-2" onClick={() => onAction(row, 'RECEIVE')}>
        Ingresar
      </Button>
      <Button variant="secondary" className="px-2" onClick={() => onAction(row, 'WITHDRAW')}>
        Retirar
      </Button>
      <Button variant="secondary" className="px-2" onClick={() => onAction(row, 'ADJUST')}>
        Ajustar
      </Button>
    </div>
  );
}

function VariantRow({ row, ...actions }: RowActions & { row: StockRow }) {
  const [history, setHistory] = useState(false);
  return (
    <li className={`flex flex-col gap-2 p-3 ${row.active ? '' : 'opacity-60'}`}>
      <div className="flex items-center gap-3">
        <VariantHead row={row} />
        <Available row={row} />
        {actions.canDeactivate && (
          <Switch
            checked={row.active}
            label={`Talla ${row.size} ${row.color ?? ''}: activa`}
            onChange={() => actions.onToggle(row)}
          />
        )}
      </div>
      {actions.canWrite && row.active && <Actions row={row} onAction={actions.onAction} />}
      <Button variant="ghost" className="min-h-10" onClick={() => setHistory(!history)} aria-expanded={history}>
        {history ? 'Ocultar historial' : 'Ver historial'}
      </Button>
      {history && <MovementsPanel variantId={row.variantId} />}
    </li>
  );
}

// Un producto = una tarjeta; cada talla/color es una fila dentro de ella (no una tarjeta por variante).
export default function ProductGroup({ name, rows, ...actions }: RowActions & { name: string; rows: StockRow[] }) {
  const total = rows.reduce((sum, row) => sum + (row.active ? row.available : 0), 0);
  return (
    <Card>
      <div className="border-line flex items-center justify-between gap-3 border-b px-4 py-3">
        <h2 className="min-w-0 truncate text-lg font-bold">{name}</h2>
        <Badge tone="neutral">{total} disponibles</Badge>
      </div>
      <ul className="divide-line divide-y">
        {rows.map((row) => (
          <VariantRow key={row.variantId} row={row} {...actions} />
        ))}
      </ul>
    </Card>
  );
}
