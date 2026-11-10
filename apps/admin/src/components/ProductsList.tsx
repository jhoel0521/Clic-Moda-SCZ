import { useCallback, useEffect, useState } from 'react';
import { setProductActive } from '../lib/active';
import { deactivateAll, listActiveWithoutStock } from '../lib/bulk';
import { api } from '../lib/client-api';
import { errorMessage, type Category, type Page, type Product } from '../lib/types';
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, SelectField, Switch } from './ui';

interface Filters {
  text: string;
  categoryId: string;
  active: string; // '', 'true' o 'false'
  stock: string; // '', 'out' (todo agotado), 'partial' (alguna agotada) o 'in' (con stock)
  page: number;
}

const PAGE_SIZE = 10;
const INITIAL: Filters = { text: '', categoryId: '', active: '', stock: '', page: 1 };

function queryOf(filters: Filters): string {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE) });
  if (filters.text.trim()) params.set('text', filters.text.trim());
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.active) params.set('active', filters.active);
  if (filters.stock) params.set('stock', filters.stock);
  return params.toString();
}

function useProducts(filters: Filters) {
  const [data, setData] = useState<Page<Product> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const query = queryOf(filters);
  const reload = useCallback(async () => {
    try {
      setData(await api<Page<Product>>('GET', `catalog/products?${query}`));
      setError(null);
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }, [query]);
  // Al cambiar de vista o de filtro se descartan los datos anteriores: no se muestran listas ni totales viejos.
  useEffect(() => {
    setData(null);
    void reload();
  }, [reload]);
  return { data, setData, error, reload, setError };
}

function useCategoryNames(): Map<string, string> {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    api<Category[]>('GET', 'catalog/categories').then(setCategories, () => undefined);
  }, []);
  return new Map(categories.map((category) => [category.id, category.name]));
}

const priceRange = (product: Product): string => {
  const prices = product.variants.map((variant) => Number(variant.price));
  const [low, high] = [Math.min(...prices), Math.max(...prices)];
  return low === high ? `Bs ${low.toFixed(2)}` : `Bs ${low.toFixed(2)} – ${high.toFixed(2)}`;
};

// Una sola línea de stock por producto: lo disponible y, si hay, cuántas variantes están agotadas.
function StockLine({ product }: { product: Product }) {
  const units = product.available;
  const soldOut = product.soldOutVariants ?? 0;
  if (units === undefined) return null;
  if (units === 0) return <p className="text-warning text-sm font-semibold">Todo agotado</p>;
  const detail = soldOut > 0 ? ` · ${soldOut} de ${product.variants.length} variantes agotadas` : '';
  return (
    <p className={`text-sm ${soldOut > 0 ? 'text-warning font-medium' : 'text-muted'}`}>
      {units} disponibles{detail}
    </p>
  );
}

interface RowProps {
  product: Product;
  categoryName: string;
  canWrite: boolean;
  onToggle: (product: Product) => void;
}

function ProductInfo({ product, categoryName }: Pick<RowProps, 'product' | 'categoryName'>) {
  return (
    <>
      <p className="truncate font-semibold">{product.name}</p>
      <p className="text-muted truncate text-sm">
        {categoryName} · {priceRange(product)}
      </p>
      <StockLine product={product} />
    </>
  );
}

// Una fila por producto: toca el nombre para editar y usa el interruptor para habilitar o deshabilitar.
function ProductRow({ product, categoryName, canWrite, onToggle }: RowProps) {
  const info = <ProductInfo product={product} categoryName={categoryName} />;
  return (
    <li className={`flex items-center gap-2 px-4 py-2 ${product.active ? '' : 'opacity-60'}`}>
      {canWrite ? (
        <a href={`/productos/${product.id}`} className="min-w-0 flex-1 py-2">
          {info}
        </a>
      ) : (
        <div className="min-w-0 flex-1 py-2">{info}</div>
      )}
      {canWrite ? (
        <Switch checked={product.active} label={`${product.name}: activo`} onChange={() => onToggle(product)} />
      ) : (
        <Badge tone={product.active ? 'success' : 'neutral'}>{product.active ? 'Activo' : 'Inactivo'}</Badge>
      )}
    </li>
  );
}

interface FilterBarProps {
  filters: Filters;
  categories: Map<string, string>;
  onChange: (changes: Partial<Filters>) => void;
}

const STATES = [
  { value: 'true', label: 'Activos' },
  { value: 'false', label: 'Inactivos' },
];

const STOCK = [
  { value: 'out', label: 'Todo agotado' },
  { value: 'partial', label: 'Alguna agotada' },
  { value: 'in', label: 'Con stock' },
];

function StateFilters({ filters, onChange }: Pick<FilterBarProps, 'filters' | 'onChange'>) {
  return (
    <>
      <SelectField
        label="Estado"
        value={filters.active}
        options={STATES}
        placeholder="Todos"
        onChange={(e) => onChange({ active: e.target.value })}
      />
      <SelectField
        label="Stock"
        value={filters.stock}
        options={STOCK}
        placeholder="Todos"
        onChange={(e) => onChange({ stock: e.target.value })}
      />
    </>
  );
}

function SelectFilters({ filters, categories, onChange }: FilterBarProps) {
  const options = [...categories].map(([value, label]) => ({ value, label }));
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="col-span-2">
        <SelectField
          label="Categoría"
          value={filters.categoryId}
          options={options}
          placeholder="Todas"
          onChange={(e) => onChange({ categoryId: e.target.value })}
        />
      </div>
      <StateFilters filters={filters} onChange={onChange} />
    </div>
  );
}

function FilterBar({ filters, categories, onChange }: FilterBarProps) {
  const set = (changes: Partial<Filters>) => onChange({ ...changes, page: 1 });
  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Buscar por nombre o SKU"
        type="search"
        enterKeyHint="search"
        value={filters.text}
        onChange={(e) => set({ text: e.target.value })}
      />
      <SelectFilters filters={filters} categories={categories} onChange={set} />
    </div>
  );
}

// Pide los activos totalmente agotados, confirma con la cantidad real y los desactiva (no borra nada).
async function bulkDeactivate(filters: Filters): Promise<string | null> {
  const found = await listActiveWithoutStock(filters);
  if (found.length === 0) return 'No hay productos activos sin stock.';
  const ask = `¿Desactivar ${found.length} producto(s) sin stock? Podrás reactivarlos cuando vuelvan a tener.`;
  if (!window.confirm(ask)) return null;
  return `Listo: ${await deactivateAll(found)} producto(s) desactivados.`;
}

function useBulk(filters: Filters, onDone: () => Promise<void>) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      setMessage(await bulkDeactivate(filters));
      await onDone();
    } catch (failure) {
      setMessage(errorMessage(failure));
    }
    setBusy(false);
  };
  return { message, busy, run };
}

// Con el filtro "Todo agotado": desactiva de una vez todos los productos activos sin una sola unidad.
function BulkDeactivate({ filters, onDone }: { filters: Filters; onDone: () => Promise<void> }) {
  const { message, busy, run } = useBulk(filters, onDone);
  return (
    <div className="flex flex-col gap-2">
      <Button variant="danger" block icon="trash" disabled={busy} onClick={() => void run()}>
        {busy ? 'Desactivando…' : 'Desactivar todos los agotados'}
      </Button>
      {message && (
        <p role="status" className="text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
}

interface PagerProps {
  page: number;
  total: number;
  onPage: (page: number) => void;
}

function PageInfo({ page, pages, total }: { page: number; pages: number; total: number }) {
  return (
    <span className="text-muted text-center text-sm">
      Página {page} de {pages}
      <br />
      {total} {total === 1 ? 'producto' : 'productos'}
    </span>
  );
}

function Pager({ page, total, onPage }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex items-center justify-between gap-3">
      <Button
        variant="secondary"
        icon="left"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        aria-label="Página anterior"
      />
      <PageInfo page={page} pages={pages} total={total} />
      <Button
        variant="secondary"
        icon="right"
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        aria-label="Página siguiente"
      />
    </div>
  );
}

interface ItemsProps {
  items: Product[];
  names: Map<string, string>;
  canWrite: boolean;
  onToggle: (product: Product) => void;
}

function EmptyProducts({ canWrite }: { canWrite: boolean }) {
  return (
    <EmptyState title="No hay productos con esos filtros" icon="box">
      {canWrite && (
        <a href="/productos/nuevo" className="text-action font-semibold underline">
          Registrar un producto
        </a>
      )}
    </EmptyState>
  );
}

function Items({ items, names, canWrite, onToggle }: ItemsProps) {
  if (items.length === 0) return <EmptyProducts canWrite={canWrite} />;
  return (
    <Card>
      <ul className="divide-line divide-y">
        {items.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            categoryName={names.get(product.categoryId) ?? '—'}
            canWrite={canWrite}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </Card>
  );
}

// Interruptor optimista: cambia al instante y, si el servidor falla, vuelve atrás y avisa.
function useToggle(
  data: Page<Product> | null,
  setData: (page: Page<Product>) => void,
  setError: (message: string | null) => void
) {
  return (product: Product) => {
    if (!data) return;
    const mark = (active: boolean) =>
      setData({ ...data, items: data.items.map((item) => (item.id === product.id ? { ...item, active } : item)) });
    mark(!product.active);
    setProductActive(product.id, !product.active).catch((failure) => {
      mark(product.active);
      setError(errorMessage(failure));
    });
  };
}

function ListStatus({ error, loading }: { error: string | null; loading: boolean }) {
  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  return loading ? <p className="text-muted">Cargando…</p> : null;
}

function useFilters() {
  const [filters, setFilters] = useState<Filters>(INITIAL);
  const merge = (changes: Partial<Filters>) => setFilters({ ...filters, ...changes });
  return { filters, setFilters, merge };
}

interface BodyProps {
  filters: Filters;
  data: Page<Product>;
  names: Map<string, string>;
  canWrite: boolean;
  onFilters: (filters: Filters) => void;
  onToggle: (product: Product) => void;
}

function Body({ filters, data, names, canWrite, onFilters, onToggle }: BodyProps) {
  return (
    <>
      <Items items={data.items} names={names} canWrite={canWrite} onToggle={onToggle} />
      <Pager page={filters.page} total={data.total} onPage={(page) => onFilters({ ...filters, page })} />
    </>
  );
}

export default function ProductsList({ canWrite }: { canWrite: boolean }) {
  const { filters, setFilters, merge } = useFilters();
  const { data, setData, error, reload, setError } = useProducts(filters);
  const names = useCategoryNames();
  const toggle = useToggle(data, setData, setError);
  return (
    <div className="flex flex-col gap-4">
      <FilterBar filters={filters} categories={names} onChange={merge} />
      <ListStatus error={error} loading={data === null} />
      {canWrite && filters.stock === 'out' && <BulkDeactivate filters={filters} onDone={reload} />}
      {data && (
        <Body
          filters={filters}
          data={data}
          names={names}
          canWrite={canWrite}
          onFilters={setFilters}
          onToggle={toggle}
        />
      )}
    </div>
  );
}
