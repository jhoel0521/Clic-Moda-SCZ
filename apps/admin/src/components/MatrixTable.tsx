import { cellOf, colorsOf, colorTotal, sizesOf, toneOf, type Tone } from '../lib/matrix';
import type { Product, Variant } from '../lib/types';

const TONES: Record<Tone, string> = {
  out: 'border-danger bg-red-50 text-danger font-bold',
  low: 'border-warning bg-amber-50 text-warning font-bold',
  ok: 'border-line bg-surface text-text',
  off: 'border-line bg-bg-soft text-muted line-through',
};

const STATE_TEXT: Record<Tone, string> = { out: ', agotada', low: ', stock bajo', off: ', inactiva', ok: '' };

interface CellProps {
  variant: Variant | undefined;
  selected: boolean;
  onSelect: (variant: Variant) => void;
}

// Una celda = una variante (color + talla). Vacía si ese color no existe en esa talla.
function Cell({ variant, selected, onSelect }: CellProps) {
  if (!variant) return <td className="text-muted p-1 text-center">—</td>;
  const ring = selected ? 'ring-2 ring-action' : '';
  return (
    <td className="p-1 text-center">
      <button
        type="button"
        aria-label={`Talla ${variant.size} ${variant.color ?? ''}: ${variant.available ?? 0} disponibles${STATE_TEXT[toneOf(variant)]}`}
        aria-pressed={selected}
        onClick={() => onSelect(variant)}
        className={`min-h-12 w-full min-w-12 rounded-lg border text-base ${TONES[toneOf(variant)]} ${ring}`}
      >
        {variant.available ?? 0}
      </button>
    </td>
  );
}

interface Props {
  product: Product;
  selectedId: string | null;
  onSelect: (variant: Variant) => void;
}

function Header({ sizes }: { sizes: string[] }) {
  return (
    <tr className="text-muted text-sm">
      <th className="bg-surface sticky left-0 z-10 p-2 text-left font-semibold">Color</th>
      {sizes.map((size) => (
        <th key={size} className="p-2 font-semibold">
          {size}
        </th>
      ))}
      <th className="p-2 text-right font-semibold">Total</th>
    </tr>
  );
}

interface RowProps extends Props {
  color: string;
  sizes: string[];
}

function ColorRow({ product, color, sizes, selectedId, onSelect }: RowProps) {
  return (
    <tr className="border-line border-t">
      <th scope="row" className="bg-surface sticky left-0 z-10 p-2 text-left font-semibold">
        {color}
      </th>
      {sizes.map((size) => {
        const variant = cellOf(product, color, size);
        return <Cell key={size} variant={variant} selected={variant?.id === selectedId} onSelect={onSelect} />;
      })}
      <td className="p-2 text-right text-lg font-bold">{colorTotal(product, color)}</td>
    </tr>
  );
}

// Tabla modelo × color × talla; el primer dato (color) queda fijo al desplazar en el celular.
export default function MatrixTable({ product, selectedId, onSelect }: Props) {
  const sizes = sizesOf(product);
  return (
    <div className="border-line overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse">
        <thead>
          <Header sizes={sizes} />
        </thead>
        <tbody>
          {colorsOf(product).map((color) => (
            <ColorRow
              key={color}
              product={product}
              color={color}
              sizes={sizes}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
