import { useCallback, useEffect, useState } from 'react';
import { setProductActive, setVariantActive } from '../lib/active';
import { api } from '../lib/client-api';
import { toStockRow } from '../lib/matrix';
import type { MovementKind } from '../lib/stock';
import { errorMessage, type Category, type Page, type Product, type Variant } from '../lib/types';
import ModelCard from './ModelCard';
import MovementSheet from './MovementSheet';
import { Button, EmptyState, ErrorBanner, Field, SelectField } from './ui';

interface Filters {
  text: string;
  categoryId: string;
  stock: string; // '', 'partial' (alguna agotada) u 'out' (todo agotado)
  page: number;
}

interface Summary {
  models: number;
  units: number;
  soldOutVariants: number;
  lowStockVariants: number;
}

const PAGE_SIZE = 10;
const STOCK = [
  { value: 'partial', label: 'Con variantes agotadas' },
  { value: 'out', label: 'Todo agotado' },
  { value: 'in', label: 'Con stock' },
];

function queryOf(filters: Filters): string {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE) });
  if (filters.text.trim()) params.set('text', filters.text.trim());
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.stock) params.set('stock', filters.stock);
  return params.toString();
}

function useModels(filters: Filters) {
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
  // Al cambiar de filtro se descartan los datos anteriores: no se muestran listas ni totales viejos.
  useEffect(() => {
    setData(null);
    void reload();
  }, [reload]);
  return { data, setData, error, setError, reload };
}

function useSummary(trigger: unknown): Summary | null {
  const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => {
    api<Summary>('GET', 'inventory/summary').then(setSummary, () => undefined);
  }, [trigger]);
  return summary;
}

function useCategories(): Map<string, string> {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    api<Category[]>('GET', 'catalog/categories').then(setCategories, () => undefined);
  }, []);
  return new Map(categories.map((category) => [category.id, category.name]));
}

function Figure({ label, value, tone = '' }: { label: string; value: number | string; tone?: string }) {
  return (
    <div className="bg-surface shadow-card rounded-xl p-3 text-center">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-muted text-xs font-medium">{label}</p>
    </div>
  );
}

// Indicadores de arriba: modelos, pares en total, variantes agotadas y con stock bajo.
function SummaryStrip({ summary }: { summary: Summary | null }) {
  return (
    <div className="grid grid-cols-4 gap-2" aria-label="Resumen del inventario">
      <Figure label="Modelos" value={summary?.models ?? '–'} />
      <Figure label="Pares" value={summary?.units ?? '–'} />
      <Figure label="Agotadas" value={summary?.soldOutVariants ?? '–'} tone="text-danger" />
      <Figure label="Stock bajo" value={summary?.lowStockVariants ?? '–'} tone="text-warning" />
    </div>
  );
}

interface FilterProps {
  filters: Filters;
  categories: Map<string, string>;
  onChange: (changes: Partial<Filters>) => void;
}

function SelectFilters({ filters, categories, onChange }: FilterProps) {
  const options = [...categories].map(([value, label]) => ({ value, label }));
  return (
    <div className="grid grid-cols-2 gap-3">
      <SelectField
        label="Categoría"
        value={filters.categoryId}
        options={options}
        placeholder="Todas"
        onChange={(e) => onChange({ categoryId: e.target.value })}
      />
      <SelectField
        label="Stock"
        value={filters.stock}
        options={STOCK}
        placeholder="Todos"
        onChange={(e) => onChange({ stock: e.target.value })}
      />
    </div>
  );
}

function FilterBar({ filters, categories, onChange }: FilterProps) {
  const set = (changes: Partial<Filters>) => onChange({ ...changes, page: 1 });
  return (
    <div className="flex flex-col gap-3">
      <Field
        label="Buscar por modelo o SKU"
        type="search"
        enterKeyHint="search"
        value={filters.text}
        onChange={(e) => set({ text: e.target.value })}
      />
      <SelectFilters filters={filters} categories={categories} onChange={set} />
    </div>
  );
}

function Pager({ page, total, onPage }: { page: number; total: number; onPage: (page: number) => void }) {
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
      <span className="text-muted text-center text-sm">
        Página {page} de {pages} · {total} modelos
      </span>
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

interface Action {
  product: Product;
  variant: Variant;
  kind: MovementKind;
}

interface Rights {
  canWrite: boolean;
  canDeactivate: boolean;
}

// Interruptores optimistas (modelo y variante): cambian al instante y, si el servidor falla, vuelven atrás y avisan.
function useToggles(model: ReturnType<typeof useModels>, onChanged: () => void) {
  const { data, setData, setError } = model;
  const patch = (change: (product: Product) => Product, send: Promise<unknown>, undo: (p: Product) => Product) => {
    if (!data) return;
    setData({ ...data, items: data.items.map(change) });
    send.then(onChanged, (failure) => {
      setData({ ...data, items: data.items.map(undo) });
      setError(errorMessage(failure));
    });
  };
  const product = (target: Product) => {
    const flip = (active: boolean) => (item: Product) => (item.id === target.id ? { ...item, active } : item);
    patch(flip(!target.active), setProductActive(target.id, !target.active), flip(target.active));
  };
  const variant = (target: Variant) => {
    const flip = (active: boolean) => (item: Product) => ({
      ...item,
      variants: item.variants.map((v) => (v.id === target.id ? { ...v, active } : v)),
    });
    patch(flip(!target.active), setVariantActive(target.id, !target.active), flip(target.active));
  };
  return { product, variant };
}

interface ListProps extends Rights {
  items: Product[];
  names: Map<string, string>;
  toggles: ReturnType<typeof useToggles>;
  onAction: (action: Action) => void;
  onReload: () => void;
}

function Models({ items, names, toggles, onAction, onReload, ...rights }: ListProps) {
  if (items.length === 0) return <EmptyState title="No hay modelos con esos filtros" icon="box" />;
  return (
    <ul className="flex flex-col gap-3">
      {items.map((product) => (
        <li key={product.id}>
          <ModelCard
            product={product}
            categoryName={names.get(product.categoryId) ?? '—'}
            onToggleProduct={toggles.product}
            onReload={onReload}
            onToggle={toggles.variant}
            onAction={(variant, kind) => onAction({ product, variant, kind })}
            {...rights}
          />
        </li>
      ))}
    </ul>
  );
}

function Status({ error, loading }: { error: string | null; loading: boolean }) {
  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  return loading ? <p className="text-muted">Cargando…</p> : null;
}

interface BoardProps extends Rights {
  model: ReturnType<typeof useModels>;
  data: Page<Product>;
  filters: Filters;
  names: Map<string, string>;
  onFilters: (changes: Partial<Filters>) => void;
  onAction: (action: Action) => void;
}

function Board({ model, data, filters, names, onFilters, onAction, ...rights }: BoardProps) {
  const toggles = useToggles(model, () => void model.reload());
  return (
    <>
      <Models
        items={data.items}
        names={names}
        toggles={toggles}
        onAction={onAction}
        onReload={() => void model.reload()}
        {...rights}
      />
      <Pager page={filters.page} total={data.total} onPage={(page) => onFilters({ page })} />
    </>
  );
}

function ActionSheet({ action, onClose, onDone }: { action: Action; onClose: () => void; onDone: () => void }) {
  const row = toStockRow(action.product, action.variant);
  return (
    <MovementSheet
      key={action.variant.id + action.kind}
      row={row}
      kind={action.kind}
      onClose={onClose}
      onDone={onDone}
    />
  );
}

function useBoard() {
  const [filters, setFilters] = useState<Filters>({ text: '', categoryId: '', stock: '', page: 1 });
  const model = useModels(filters);
  const merge = (changes: Partial<Filters>) => setFilters({ ...filters, ...changes });
  return { filters, merge, model, names: useCategories(), summary: useSummary(model.data) };
}

export default function InventoryBoard(rights: Rights) {
  const { filters, merge, model, names, summary } = useBoard();
  const [action, setAction] = useState<Action | null>(null);
  return (
    <div className="flex flex-col gap-4">
      <SummaryStrip summary={summary} />
      <FilterBar filters={filters} categories={names} onChange={merge} />
      <Status error={model.error} loading={model.data === null} />
      {model.data && (
        <Board
          model={model}
          data={model.data}
          filters={filters}
          names={names}
          onFilters={merge}
          onAction={setAction}
          {...rights}
        />
      )}
      {action && <ActionSheet action={action} onClose={() => setAction(null)} onDone={() => void model.reload()} />}
    </div>
  );
}
