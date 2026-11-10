import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/client-api';
import type { MovementKind, StockRow } from '../lib/stock';
import { errorMessage, type Page } from '../lib/types';
import MovementSheet from './MovementSheet';
import StockCard from './StockCard';
import { Badge, Button, EmptyState, ErrorBanner, Field } from './ui';

type Tab = 'stock' | 'low';
const PAGE_SIZE = 10;

interface View {
  tab: Tab;
  text: string;
  page: number;
}

function urlOf({ tab, text, page }: View): string {
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (text.trim()) query.set('text', text.trim());
  return `inventory/stock${tab === 'low' ? '/low' : ''}?${query.toString()}`;
}

function useStock(view: View) {
  const [data, setData] = useState<Page<StockRow> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const url = urlOf(view);
  const reload = useCallback(async () => {
    try {
      setData(await api<Page<StockRow>>('GET', url));
      setError(null);
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }, [url]);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, reload };
}

function usePending(trigger: unknown): number {
  const [pending, setPending] = useState(0);
  useEffect(() => {
    api<{ pending: number }>('GET', 'inventory/queue').then(
      (queue) => setPending(queue.pending),
      () => undefined
    );
  }, [trigger]);
  return pending;
}

function Tabs({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <div className="bg-hover grid grid-cols-2 gap-2 rounded-2xl p-1" role="group" aria-label="Vista">
      <Button
        variant={tab === 'stock' ? 'primary' : 'ghost'}
        aria-pressed={tab === 'stock'}
        onClick={() => onTab('stock')}
      >
        Todo el stock
      </Button>
      <Button variant={tab === 'low' ? 'primary' : 'ghost'} aria-pressed={tab === 'low'} onClick={() => onTab('low')}>
        Stock bajo
      </Button>
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
        Página {page} de {pages}
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

interface ListProps {
  data: Page<StockRow>;
  tab: Tab;
  canWrite: boolean;
  onAction: (row: StockRow, kind: MovementKind) => void;
}

function StockList({ data, tab, canWrite, onAction }: ListProps) {
  if (data.items.length === 0) {
    const title = tab === 'low' ? 'Nada por reponer: todo tiene stock suficiente' : 'No hay variantes con esa búsqueda';
    return <EmptyState title={title} icon="warehouse" />;
  }
  return (
    <ul className="flex flex-col gap-3">
      {data.items.map((row) => (
        <li key={row.variantId}>
          <StockCard row={row} canWrite={canWrite} onAction={onAction} />
        </li>
      ))}
    </ul>
  );
}

interface Action {
  row: StockRow;
  kind: MovementKind;
}

function useView() {
  const [view, setView] = useState<View>({ tab: 'stock', text: '', page: 1 });
  const change = (changes: Partial<View>) => setView({ ...view, page: 1, ...changes });
  return { view, change, setPage: (page: number) => setView({ ...view, page }) };
}

function Filters({ view, change }: { view: View; change: (changes: Partial<View>) => void }) {
  return (
    <>
      <Tabs tab={view.tab} onTab={(tab) => change({ tab })} />
      <Field
        label="Buscar por producto o SKU"
        type="search"
        enterKeyHint="search"
        value={view.text}
        onChange={(e) => change({ text: e.target.value })}
      />
    </>
  );
}

function Status({ error, loading }: { error: string | null; loading: boolean }) {
  if (error) return <ErrorBanner>{error}</ErrorBanner>;
  return loading ? <p className="text-muted">Cargando…</p> : null;
}

export default function StockManager({ canWrite }: { canWrite: boolean }) {
  const { view, change, setPage } = useView();
  const [action, setAction] = useState<Action | null>(null);
  const { data, error, reload } = useStock(view);
  const pending = usePending(data);
  return (
    <div className="flex flex-col gap-4">
      <Filters view={view} change={change} />
      {pending > 0 && <Badge tone="brand">{pending} en cola</Badge>}
      <Status error={error} loading={data === null} />
      {data && (
        <StockList data={data} tab={view.tab} canWrite={canWrite} onAction={(row, kind) => setAction({ row, kind })} />
      )}
      {data && <Pager page={view.page} total={data.total} onPage={setPage} />}
      {action && (
        <MovementSheet
          key={action.row.variantId + action.kind}
          {...action}
          onClose={() => setAction(null)}
          onDone={() => void reload()}
        />
      )}
    </div>
  );
}
