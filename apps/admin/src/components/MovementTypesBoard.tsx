import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '../lib/client-api';
import {
  CLASS_TABS,
  createMovementType,
  fetchMovementTypes,
  typesOfKind,
  updateMovementType,
  type MovementTypeItem,
} from '../lib/movement-types';
import type { MovementKind } from '../lib/stock';
import { errorMessage } from '../lib/types';
import { Badge, Button, Card, ErrorBanner, Field, Switch } from './ui';

// Carga y acciones de la lista de tipos. El Gerente también ve los desactivados; el resto solo los activos.
function useTypes(canWrite: boolean) {
  const [types, setTypes] = useState<MovementTypeItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const load = useCallback(async () => {
    setError(null);
    try {
      setTypes(await fetchMovementTypes(canWrite));
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }, [canWrite]);
  useEffect(() => {
    void load();
  }, [load]);
  return { types, error, notice, setNotice, load };
}

type Board = ReturnType<typeof useTypes>;

// Texto del error de un campo cuando la API responde 422 con el campo; si no, el mensaje general.
const fieldMessage = (failure: unknown, field: string): string | null =>
  failure instanceof ApiError ? (failure.issues.find((issue) => issue.field === field)?.message ?? null) : null;

interface EditorProps {
  type: MovementTypeItem;
  onSave: (name: string) => Promise<string | null>;
  onToggle: (active: boolean) => void;
  onClose: () => void;
}

// Editor de un tipo: nombre (el código y la clase no cambian) y si está activo.
function TypeEditor({ type, onSave, onToggle, onClose }: EditorProps) {
  const [name, setName] = useState(type.name);
  const [error, setError] = useState<string | null>(null);
  const save = async () => setError(await onSave(name));
  return (
    <div className="flex flex-col gap-3 pt-3">
      <Field label="Nombre" value={name} maxLength={60} error={error} onChange={(e) => setName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={() => void save()}>Guardar</Button>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">{type.system ? 'Los tipos de sistema no se desactivan' : 'Activo'}</span>
        <Switch label="Tipo activo" checked={type.active} disabled={type.system} onChange={onToggle} />
      </div>
    </div>
  );
}

function TypeSummary({ type }: { type: MovementTypeItem }) {
  return (
    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      <span className="truncate font-semibold">{type.name}</span>
      {type.system && <Badge tone="brand">De sistema</Badge>}
      {!type.active && <Badge tone="neutral">Desactivado</Badge>}
    </span>
  );
}

interface RowProps {
  type: MovementTypeItem;
  canWrite: boolean;
  open: boolean;
  onOpen: () => void;
  editor: EditorProps;
}

// Una fila por tipo con UN solo control (abrirla): así la lista no suma opciones por fila (Hick).
function TypeRow({ type, canWrite, open, onOpen, editor }: RowProps) {
  if (!canWrite) {
    return (
      <Card className="flex min-h-14 items-center p-3">
        <TypeSummary type={type} />
      </Card>
    );
  }
  return (
    <Card className="p-3">
      <button
        type="button"
        data-type-code={type.code}
        aria-expanded={open}
        onClick={onOpen}
        className="flex min-h-12 w-full items-center text-left"
      >
        <TypeSummary type={type} />
      </button>
      {open && <TypeEditor {...editor} />}
    </Card>
  );
}

function KindTabs({
  kind,
  onChange,
  types,
}: {
  kind: MovementKind;
  onChange: (k: MovementKind) => void;
  types: MovementTypeItem[];
}) {
  return (
    <div role="group" aria-label="Clase de movimiento" className="grid grid-cols-3 gap-2">
      {CLASS_TABS.map((tab) => (
        <Button
          key={tab.kind}
          variant="secondary"
          className={tab.kind === kind ? 'border-action bg-tint text-action' : ''}
          aria-pressed={tab.kind === kind}
          onClick={() => onChange(tab.kind)}
        >
          {tab.plural} ({typesOfKind(types, tab.kind).length})
        </Button>
      ))}
    </div>
  );
}

interface NewTypeFormProps {
  singular: string;
  name: string;
  error: string | null;
  onName: (value: string) => void;
  onSubmit: (event: { preventDefault: () => void }) => void;
}

function NewTypeForm({ singular, name, error, onName, onSubmit }: NewTypeFormProps) {
  return (
    <Card className="p-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field
            label={`Nuevo tipo de ${singular}`}
            placeholder="Ej: Cambio por talla"
            value={name}
            maxLength={60}
            error={error}
            onChange={(e) => onName(e.target.value)}
          />
        </div>
        <Button type="submit" icon="plus" disabled={name.trim().length < 3}>
          Agregar
        </Button>
      </form>
    </Card>
  );
}

function NewType({ kind, onCreate }: { kind: MovementKind; onCreate: (name: string) => Promise<string | null> }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const singular = CLASS_TABS.find((tab) => tab.kind === kind)?.singular ?? '';
  const submit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const failure = await onCreate(name);
    setError(failure);
    if (!failure) setName('');
  };
  return (
    <NewTypeForm singular={singular} name={name} error={error} onName={setName} onSubmit={(e) => void submit(e)} />
  );
}

interface ListProps {
  types: MovementTypeItem[];
  canWrite: boolean;
  board: Board;
}

// Acciones del Gerente sobre un tipo: guardan, recargan, anuncian el resultado y devuelven el error del campo.
function useActions({ board }: { board: Board }) {
  const { load, setNotice } = board;
  const save = async (type: MovementTypeItem, changes: { name?: string; active?: boolean }, done: string) => {
    try {
      await updateMovementType(type.code, changes);
      await load();
      setNotice(done);
      return null;
    } catch (failure) {
      return fieldMessage(failure, 'name') ?? errorMessage(failure);
    }
  };
  const create = async (name: string, kind: MovementKind) => {
    try {
      const created = await createMovementType(name, kind);
      await load();
      setNotice(`Tipo «${created.name}» creado`);
      requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-type-code="${created.code}"]`)?.focus());
      return null;
    } catch (failure) {
      return fieldMessage(failure, 'name') ?? errorMessage(failure);
    }
  };
  return { save, create };
}

type Actions = ReturnType<typeof useActions>;

interface ItemProps {
  type: MovementTypeItem;
  canWrite: boolean;
  open: boolean;
  onToggleOpen: () => void;
  save: Actions['save'];
}

function TypeItem({ type, canWrite, open, onToggleOpen, save }: ItemProps) {
  const toggled = (active: boolean) => `Tipo «${type.name}» ${active ? 'activado' : 'desactivado'}`;
  const editor: EditorProps = {
    type,
    onSave: (name) => save(type, { name }, `Tipo renombrado a «${name.trim()}»`),
    onToggle: (active) => void save(type, { active }, toggled(active)),
    onClose: onToggleOpen,
  };
  return (
    <li>
      <TypeRow type={type} canWrite={canWrite} open={open} onOpen={onToggleOpen} editor={editor} />
    </li>
  );
}

function TypeList({ types, canWrite, board }: ListProps) {
  const [kind, setKind] = useState<MovementKind>('RECEIVE');
  const [openCode, setOpenCode] = useState<string | null>(null);
  const { save, create } = useActions({ board });
  return (
    <div className="flex flex-col gap-4">
      <KindTabs kind={kind} onChange={setKind} types={types} />
      <ul className="flex flex-col gap-3">
        {typesOfKind(types, kind).map((type) => (
          <TypeItem
            key={type.code}
            type={type}
            canWrite={canWrite}
            open={openCode === type.code}
            onToggleOpen={() => setOpenCode(openCode === type.code ? null : type.code)}
            save={save}
          />
        ))}
      </ul>
      {canWrite && openCode === null && <NewType kind={kind} onCreate={(name) => create(name, kind)} />}
    </div>
  );
}

function Content({ board, canWrite }: { board: Board; canWrite: boolean }) {
  if (board.types === null && !board.error) return <p className="text-muted">Cargando…</p>;
  if (board.types === null) return null;
  return <TypeList types={board.types} canWrite={canWrite} board={board} />;
}

// Tipos de movimiento: el Gerente los crea, renombra, activa y desactiva; el resto solo los consulta.
export default function MovementTypesBoard({ canWrite }: { canWrite: boolean }) {
  const board = useTypes(canWrite);
  return (
    <div className="flex flex-col gap-4">
      <p role="status" aria-live="polite" className="text-success font-medium empty:hidden">
        {board.notice}
      </p>
      {board.error && (
        <ErrorBanner>
          <span>{board.error}</span>{' '}
          <Button variant="secondary" onClick={() => void board.load()}>
            Reintentar
          </Button>
        </ErrorBanner>
      )}
      <Content board={board} canWrite={canWrite} />
    </div>
  );
}
