import { useState } from 'react';
import type { MovementKind, StockRow } from '../lib/stock';
import MovementsPanel from './MovementsPanel';
import { Badge, Button, Card } from './ui';

interface Props {
  row: StockRow;
  canWrite: boolean;
  onAction: (row: StockRow, kind: MovementKind) => void;
}

function Numbers({ row }: { row: StockRow }) {
  const low = row.available <= row.reorderLevel;
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-muted text-sm">Disponible</p>
        <p className={`text-3xl font-bold ${low ? 'text-warning' : ''}`}>{row.available}</p>
      </div>
      <p className="text-muted text-right text-sm">
        Físico {row.onHand} · Reservado {row.reserved}
        <br />
        {row.location ?? 'Sin ubicación'}
      </p>
    </div>
  );
}

function Title({ row }: { row: StockRow }) {
  const detail = [`Talla ${row.size}`, row.color].filter(Boolean).join(' · ');
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{row.productName}</p>
        <p className="text-muted truncate text-sm">
          {detail} · {row.sku}
        </p>
      </div>
      {row.available <= row.reorderLevel && <Badge tone="warning">Stock bajo</Badge>}
    </div>
  );
}

function Actions({ row, onAction }: Pick<Props, 'row' | 'onAction'>) {
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

export default function StockCard({ row, canWrite, onAction }: Props) {
  const [showHistory, setShowHistory] = useState(false);
  return (
    <Card className="flex flex-col gap-3 p-4">
      <Title row={row} />
      <Numbers row={row} />
      {canWrite && <Actions row={row} onAction={onAction} />}
      <Button
        variant="ghost"
        icon={showHistory ? 'left' : 'right'}
        onClick={() => setShowHistory(!showHistory)}
        aria-expanded={showHistory}
      >
        {showHistory ? 'Ocultar historial' : 'Ver historial'}
      </Button>
      {showHistory && <MovementsPanel variantId={row.variantId} />}
    </Card>
  );
}
