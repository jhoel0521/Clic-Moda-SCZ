import { useCallback, useEffect, useState } from 'react';
import { setVariantActive } from '../lib/active';
import { deactivateVariants, listSoldOutVariants } from '../lib/bulk';
import { api } from '../lib/client-api';
import type { MovementKind, StockRow } from '../lib/stock';
import { errorMessage, type Page } from '../lib/types';
import MovementSheet from './MovementSheet';
import ProductGroup, { groupByProduct, type RowActions } from './StockGroup';
import { Badge, Button, EmptyState, ErrorBanner, Field } from './ui';

type Tab = 'stock' | 'low' | 'out';
const PAGE_SIZE = 10;

interface View {
  tab: Tab;
  text: string;
  page: number;
}

const PATHS: Record<Tab, string> = { stock: 'inventory/stock', low: 'inventory/stock/low', out: 'inventory/stock' };

function urlOf({ tab, text, page }: View): string {
  const query = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
  if (text.trim()) query.set('text', text.trim());
  if (tab === 'out') query.set('soldOut', 'true');
  return `${PATHS[tab]}?${query.toString()}`;
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
  // Al cambiar de vista o de filtro se descartan los datos anteriores: no se muestran listas ni totales viejos.
  useEffect(() => {
    setData(null);
    void reload();
  }, [reload]);
  return { data, setData, error, reload, setError };
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

const TABS: { tab: Tab; label: string }[] = [
  { tab: 'stock', label: 'Todo' },
  { tab: 'low', label: 'Stock bajo' },
  { tab: 'out', label: 'Agotadas' },
];

function TabButton({
  item,
  active,
  onTab,
}: {
  item: (typeof TABS)[number];
  active: boolean;
  onTab: (tab: Tab) => void;
}) {
  return (
    <Button
      className="px-2"
      variant={active ? 'primary' : 'ghost'}
      aria-pressed={active}
      onClick={() => onTab(item.tab)}
    >
      {item.label}
    </Button>
  );
}

function Tabs({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <div className="bg-hover grid grid-cols-3 gap-2 rounded-2xl p-1" role="group" aria-label="Vista">
      {TABS.map((item) => (
        <TabButton key={item.tab} item={item} active={tab === item.tab} onTab={onTab} />
      ))}
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

const EMPTY_TITLES: Record<Tab, string> = {
  stock: 'No hay variantes con esa búsqueda',
  low: 'Nada por reponer: todo tiene stock suficiente',
  out: 'No hay variantes agotadas',
};

function StockList({ data, tab, ...actions }: RowActions & { data: Page<StockRow>; tab: Tab }) {
  if (data.items.length === 0) return <EmptyState title={EMPTY_TITLES[tab]} icon="warehouse" />;
  return (
    <ul className="flex flex-col gap-3">
      {groupByProduct(data.items).map((group) => (
        <li key={group.name}>
          <ProductGroup name={group.name} rows={group.rows} {...actions} />
        </li>
      ))}
    </ul>
  );
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

// Con la pestaña "Agotadas": desactiva de una vez todas las variantes activas agotadas (no borra nada).
async function bulkDeactivate(text: string): Promise<string | null> {
  const rows = await listSoldOutVariants(text);
  if (rows.length === 0) return 'No hay variantes activas agotadas.';
  const ask = `¿Desactivar ${rows.length} variante(s) agotadas? Podrás reactivarlas cuando vuelvan a tener stock.`;
  if (!window.confirm(ask)) return null;
  return `Listo: ${await deactivateVariants(rows)} variante(s) desactivadas.`;
}

function useBulk(text: string, onDone: () => Promise<void>) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    try {
      setMessage(await bulkDeactivate(text));
      await onDone();
    } catch (failure) {
      setMessage(errorMessage(failure));
    }
    setBusy(false);
  };
  return { message, busy, run };
}

function BulkVariants({ text, total, onDone }: { text: string; total: number; onDone: () => Promise<void> }) {
  const { message, busy, run } = useBulk(text, onDone);
  return (
    <div className="flex flex-col gap-2">
      <Button variant="danger" block icon="trash" disabled={busy || total === 0} onClick={() => void run()}>
        {busy ? 'Desactivando…' : `Desactivar las ${total} agotadas`}
      </Button>
      {message && (
        <p role="status" className="text-center font-medium">
          {message}
        </p>
      )}
    </div>
  );
}

interface Action {
  row: StockRow;
  kind: MovementKind;
}

function ActionSheet(props: { action: Action; reload: () => Promise<void>; onClose: () => void }) {
  const { action, reload, onClose } = props;
  return (
    <MovementSheet
      key={action.row.variantId + action.kind}
      {...action}
      onClose={onClose}
      onDone={() => void reload()}
    />
  );
}

interface Data {
  data: Page<StockRow>;
  setData: (page: Page<StockRow>) => void;
  reload: () => Promise<void>;
  onError: (message: string) => void;
}

// Interruptor optimista de una variante: cambia al instante; si falla vuelve atrás y avisa.
function useToggle({ data, setData, reload, onError }: Data) {
  return (row: StockRow) => {
    const mark = (active: boolean) =>
      setData({
        ...data,
        items: data.items.map((item) => (item.variantId === row.variantId ? { ...item, active } : item)),
      });
    mark(!row.active);
    setVariantActive(row.variantId, !row.active).then(reload, (failure) => {
      mark(row.active);
      onError(errorMessage(failure));
    });
  };
}

interface BodyProps extends Data {
  view: View;
  canWrite: boolean;
  canDeactivate: boolean;
  onPage: (page: number) => void;
}

function Body({ view, canWrite, canDeactivate, onPage, ...rest }: BodyProps) {
  const [action, setAction] = useState<Action | null>(null);
  const onToggle = useToggle(rest);
  return (
    <>
      {canDeactivate && view.tab === 'out' && (
        <BulkVariants text={view.text} total={rest.data.total} onDone={rest.reload} />
      )}
      <StockList
        data={rest.data}
        tab={view.tab}
        canWrite={canWrite}
        canDeactivate={canDeactivate}
        onToggle={onToggle}
        onAction={(row, kind) => setAction({ row, kind })}
      />
      <Pager page={view.page} total={rest.data.total} onPage={onPage} />
      {action && <ActionSheet action={action} reload={rest.reload} onClose={() => setAction(null)} />}
    </>
  );
}

export default function StockManager({ canWrite, canDeactivate }: { canWrite: boolean; canDeactivate: boolean }) {
  const { view, change, setPage } = useView();
  const { data, setData, error, reload, setError } = useStock(view);
  const pending = usePending(data);
  return (
    <div className="flex flex-col gap-4">
      <Filters view={view} change={change} />
      {pending > 0 && <Badge tone="brand">{pending} en cola</Badge>}
      <Status error={error} loading={data === null} />
      {data && (
        <Body
          view={view}
          data={data}
          setData={setData}
          reload={reload}
          onError={setError}
          canWrite={canWrite}
          canDeactivate={canDeactivate}
          onPage={setPage}
        />
      )}
    </div>
  );
}
