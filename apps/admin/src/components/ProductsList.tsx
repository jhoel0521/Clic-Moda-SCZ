import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/client-api';
import { errorMessage, type Category, type Page, type Product } from '../lib/types';
import { Button, EmptyState, ErrorBanner, Field, SelectField } from './ui';

interface Filters {
  text: string;
  categoryId: string;
  active: string; // '', 'true' o 'false'
  page: number;
}

const PAGE_SIZE = 10;
const INITIAL: Filters = { text: '', categoryId: '', active: '', page: 1 };

function queryOf(filters: Filters): string {
  const params = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE) });
  if (filters.text.trim()) params.set('text', filters.text.trim());
  if (filters.categoryId) params.set('categoryId', filters.categoryId);
  if (filters.active) params.set('active', filters.active);
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
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, reload, setError };
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

function RowInfo({ product, categoryName }: { product: Product; categoryName: string }) {
  const count = product.variants.length;
  return (
    <div className="min-w-48 flex-1">
      <a
        href={`/productos/${product.id}`}
        className="font-semibold underline-offset-2 hover:underline"
      >
        {product.name}
      </a>
      <p className="text-muted text-sm">
        {categoryName} · {count} {count === 1 ? 'variante' : 'variantes'} · {priceRange(product)}
      </p>
    </div>
  );
}

const Status = ({ active }: { active: boolean }) => (
  <span className={`text-sm font-semibold ${active ? 'text-success' : 'text-warning'}`}>
    {active ? 'Activo' : 'Inactivo'}
  </span>
);

interface RowProps {
  product: Product;
  categoryName: string;
  canWrite: boolean;
  onToggle: (product: Product) => void;
}

function ProductRow({ product, categoryName, canWrite, onToggle }: RowProps) {
  return (
    <li className="border-line flex flex-wrap items-center gap-3 border-b p-3 last:border-b-0">
      <RowInfo product={product} categoryName={categoryName} />
      <Status active={product.active} />
      {canWrite && (
        <Button variant="secondary" onClick={() => onToggle(product)}>
          {product.active ? 'Desactivar' : 'Activar'}
        </Button>
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

function FilterBar({ filters, categories, onChange }: FilterBarProps) {
  const options = [...categories].map(([value, label]) => ({ value, label }));
  const set = (changes: Partial<Filters>) => onChange({ ...changes, page: 1 });
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <SearchFilter value={filters.text} onChange={(text) => set({ text })} />
      <SelectField
        label="Categoría"
        value={filters.categoryId}
        options={options}
        placeholder="Todas"
        onChange={(e) => set({ categoryId: e.target.value })}
      />
      <SelectField
        label="Estado"
        value={filters.active}
        options={STATES}
        placeholder="Todos"
        onChange={(e) => set({ active: e.target.value })}
      />
    </div>
  );
}

function SearchFilter({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Field
      label="Buscar por nombre o SKU"
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

interface PagerProps {
  page: number;
  total: number;
  onPage: (page: number) => void;
}

function Pager({ page, total, onPage }: PagerProps) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Anterior
      </Button>
      <span className="text-muted">
        Página {page} de {pages} · {total} productos
      </span>
      <Button variant="secondary" disabled={page >= pages} onClick={() => onPage(page + 1)}>
        Siguiente
      </Button>
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
    <EmptyState title="No hay productos con esos filtros">
      {canWrite && (
        <a href="/productos/nuevo" className="text-action font-semibold underline">
          Registrar el primero
        </a>
      )}
    </EmptyState>
  );
}

function Items({ items, names, canWrite, onToggle }: ItemsProps) {
  if (items.length === 0) return <EmptyProducts canWrite={canWrite} />;
  return (
    <ul className="border-line bg-surface rounded-xl border">
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
  );
}

function useToggle(reload: () => Promise<void>, setError: (message: string | null) => void) {
  return (product: Product) =>
    api('PATCH', `catalog/products/${product.id}/active`, { active: !product.active })
      .then(reload)
      .catch((failure) => setError(errorMessage(failure)));
}

function Body({ filters, data, names, canWrite, onFilters, onToggle }: BodyProps) {
  return (
    <>
      <Items items={data.items} names={names} canWrite={canWrite} onToggle={onToggle} />
      <Pager
        page={filters.page}
        total={data.total}
        onPage={(page) => onFilters({ ...filters, page })}
      />
    </>
  );
}

interface BodyProps {
  filters: Filters;
  data: Page<Product>;
  names: Map<string, string>;
  canWrite: boolean;
  onFilters: (filters: Filters) => void;
  onToggle: (product: Product) => void;
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

export default function ProductsList({ canWrite }: { canWrite: boolean }) {
  const { filters, setFilters, merge } = useFilters();
  const { data, error, reload, setError } = useProducts(filters);
  const names = useCategoryNames();
  const toggle = useToggle(reload, setError);
  return (
    <div className="flex flex-col gap-4">
      <FilterBar filters={filters} categories={names} onChange={merge} />
      <ListStatus error={error} loading={data === null} />
      {data && (
        <Body
          filters={filters}
          data={data}
          names={names}
          canWrite={canWrite}
          onFilters={setFilters}
          onToggle={(p) => void toggle(p)}
        />
      )}
    </div>
  );
}
