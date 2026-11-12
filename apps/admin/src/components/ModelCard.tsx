import { useState } from 'react';
import { setProductPrice } from '../lib/active';
import { uniformPrice } from '../lib/matrix';
import { shelfOf } from '../lib/shelf';
import { errorMessage, type Product, type Variant } from '../lib/types';
import CellPanel, { type CellActions } from './CellPanel';
import MatrixTable from './MatrixTable';
import ShelfEditor from './ShelfEditor';
import { Badge, Button, ErrorBanner, Field, Switch } from './ui';

function StockBadge({ product }: { product: Product }) {
  const units = product.available ?? 0;
  const soldOut = product.soldOutVariants ?? 0;
  if (units === 0) return <Badge tone="warning">Todo agotado</Badge>;
  if (soldOut > 0) return <Badge tone="warning">{soldOut} agotadas</Badge>;
  return <Badge tone="success">Stock ok</Badge>;
}

interface HeaderProps {
  product: Product;
  categoryName: string;
  open: boolean;
  canDeactivate: boolean;
  onOpen: () => void;
  onToggle: (product: Product) => void;
}

// Cabecera del modelo: se toca para abrir la matriz; el interruptor lo habilita o deshabilita.
function Header({ product, categoryName, open, canDeactivate, onOpen, onToggle }: HeaderProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-2 ${product.active ? '' : 'opacity-60'}`}>
      <button type="button" aria-expanded={open} onClick={onOpen} className="min-w-0 flex-1 py-2 text-left">
        <p className="truncate text-lg font-bold">{product.name}</p>
        <p className="text-muted truncate text-sm">{[categoryName, shelfOf(product)].filter(Boolean).join(' · ')}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xl font-bold">{product.available ?? 0}</span>
          <span className="text-muted text-sm">pares</span>
          <StockBadge product={product} />
        </div>
      </button>
      {canDeactivate && (
        <Switch checked={product.active} label={`${product.name}: activo`} onChange={() => onToggle(product)} />
      )}
    </div>
  );
}

function usePrice(product: Product, onSaved: () => void) {
  const [value, setValue] = useState(uniformPrice(product) ?? '');
  const [error, setError] = useState<string | null>(null);
  const save = () =>
    setProductPrice(product.id, value).then(
      () => (setError(null), onSaved()),
      (failure) => setError(errorMessage(failure))
    );
  return { value, setValue, error, save };
}

// Atajo: iguala el precio de todas las tallas y colores. Para precios distintos se edita cada variante en el formulario.
function PriceEditor({ product, onSaved }: { product: Product; onSaved: () => void }) {
  const { value, setValue, error, save } = usePrice(product, onSaved);
  const mixed = uniformPrice(product) === null;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Field
            label="Mismo precio para todas las variantes (Bs)"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            hint={mixed ? 'Las variantes tienen precios distintos: al guardar quedan iguales.' : undefined}
          />
        </div>
        <Button onClick={() => void save()}>Guardar</Button>
      </div>
      {error && <ErrorBanner>{error}</ErrorBanner>}
    </div>
  );
}

interface BodyProps extends CellActions {
  product: Product;
  canWrite: boolean;
  onReload: () => void;
}

function Body({ product, onReload, ...actions }: BodyProps) {
  const [selected, setSelected] = useState<Variant | null>(null);
  const fresh = product.variants.find((variant) => variant.id === selected?.id) ?? null;
  return (
    <div className="border-line flex flex-col gap-3 border-t p-4">
      <MatrixTable product={product} selectedId={fresh?.id ?? null} onSelect={setSelected} />
      <p className="text-muted text-sm">
        Toca una celda para ingresar, retirar o ajustar esa talla y color. Rojo: agotada · Ámbar: stock bajo · Gris
        tachado: dada de baja.
      </p>
      {fresh && <CellPanel product={product} variant={fresh} {...actions} />}
      {actions.canWrite && <ShelfEditor product={product} onSaved={onReload} />}
      {actions.canDeactivate && <PriceEditor product={product} onSaved={onReload} />}
      {actions.canDeactivate && (
        <a href={`/productos/${product.id}`} className="text-action font-semibold underline">
          Editar nombre, categoría y variantes
        </a>
      )}
    </div>
  );
}

interface Props extends CellActions {
  product: Product;
  categoryName: string;
  onToggleProduct: (product: Product) => void;
  onReload: () => void;
}

export default function ModelCard({ product, categoryName, onToggleProduct, onReload, ...actions }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-line bg-surface shadow-card rounded-2xl border">
      <Header
        product={product}
        categoryName={categoryName}
        open={open}
        canDeactivate={actions.canDeactivate}
        onOpen={() => setOpen(!open)}
        onToggle={onToggleProduct}
      />
      {open && <Body product={product} onReload={onReload} {...actions} />}
    </div>
  );
}
