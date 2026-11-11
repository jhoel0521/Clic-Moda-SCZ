import { useState } from 'react';
import { toStockRow } from '../lib/matrix';
import type { MovementKind } from '../lib/stock';
import type { Product, Variant } from '../lib/types';
import MovementsPanel from './MovementsPanel';
import { Badge, Button, Switch } from './ui';

export interface CellActions {
  canWrite: boolean;
  canDeactivate: boolean;
  onAction: (variant: Variant, kind: MovementKind) => void;
  onToggle: (variant: Variant) => void;
}

function Buttons({ variant, onAction }: { variant: Variant; onAction: CellActions['onAction'] }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button onClick={() => onAction(variant, 'RECEIVE')}>Ingresar</Button>
      <Button variant="secondary" onClick={() => onAction(variant, 'WITHDRAW')}>
        Retirar
      </Button>
      <Button variant="secondary" onClick={() => onAction(variant, 'ADJUST')}>
        Ajustar
      </Button>
    </div>
  );
}

function Head({ variant }: { variant: Variant }) {
  const color = variant.color ? ` · ${variant.color}` : '';
  return (
    <div className="min-w-0 flex-1">
      <p className="truncate font-semibold">
        Talla {variant.size}
        {color}
      </p>
      <p className="text-muted truncate text-sm">
        {variant.sku} · {variant.location ?? 'Sin ubicación'}
      </p>
    </div>
  );
}

interface Props extends CellActions {
  product: Product;
  variant: Variant;
}

// Panel de la celda elegida: stock, ingresar/retirar/ajustar, habilitar la variante e historial.
export default function CellPanel({ product, variant, ...actions }: Props) {
  const [history, setHistory] = useState(false);
  return (
    <div className="bg-bg-soft flex flex-col gap-3 rounded-xl p-3" aria-live="polite">
      <div className="flex items-center gap-2">
        <Head variant={variant} />
        <Badge tone={variant.active ? 'neutral' : 'warning'}>
          {variant.active ? `${variant.available ?? 0} disp.` : 'Inactiva'}
        </Badge>
        {actions.canDeactivate && (
          <Switch checked={variant.active} label="Variante activa" onChange={() => actions.onToggle(variant)} />
        )}
      </div>
      {actions.canWrite && variant.active && <Buttons variant={variant} onAction={actions.onAction} />}
      <Button variant="ghost" className="min-h-12" aria-expanded={history} onClick={() => setHistory(!history)}>
        {history ? 'Ocultar historial' : 'Ver historial'}
      </Button>
      {history && <MovementsPanel variantId={toStockRow(product, variant).variantId} />}
    </div>
  );
}
