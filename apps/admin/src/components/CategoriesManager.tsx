import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api } from '../lib/client-api';
import { errorMessage, type Category } from '../lib/types';
import { Button, EmptyState, ErrorBanner, Field } from './ui';

// Ejecuta una acción y recarga; si falla devuelve false y muestra el error del servidor.
function useRunner(reload: () => Promise<void>, setError: (message: string | null) => void) {
  return async (action: () => Promise<unknown>): Promise<boolean> => {
    setError(null);
    try {
      await action();
      await reload();
      return true;
    } catch (failure) {
      setError(errorMessage(failure));
      return false;
    }
  };
}

function useCategories() {
  const [items, setItems] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try {
      setItems(await api<Category[]>('GET', 'catalog/categories'));
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }, []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { items, error, run: useRunner(reload, setError) };
}

function NewCategory({ onCreate }: { onCreate: (name: string) => Promise<boolean> }) {
  const [name, setName] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await onCreate(name)) setName('');
  };
  return (
    <form onSubmit={(event) => void submit(event)} className="flex flex-wrap items-end gap-3">
      <div className="min-w-56 flex-1">
        <Field
          label="Nueva categoría"
          value={name}
          maxLength={60}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={name.trim().length < 2}>
        Agregar
      </Button>
    </form>
  );
}

function ViewActions(props: { deletable: boolean; onEdit: () => void; onDelete: () => void }) {
  const hint = props.deletable ? undefined : 'Tiene productos: no se puede borrar';
  const confirmDelete = () => window.confirm('¿Borrar esta categoría?') && props.onDelete();
  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={props.onEdit}>
        Editar
      </Button>
      <Button variant="danger" disabled={!props.deletable} title={hint} onClick={confirmDelete}>
        Borrar
      </Button>
    </div>
  );
}

function EditActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className="flex gap-2">
      <Button onClick={onSave}>Guardar</Button>
      <Button variant="secondary" onClick={onCancel}>
        Cancelar
      </Button>
    </div>
  );
}

function Summary({ category }: { category: Category }) {
  const count = category.productCount;
  return (
    <div className="min-w-48 flex-1">
      <p className="font-semibold">{category.name}</p>
      <p className="text-muted text-sm">
        {count} {count === 1 ? 'producto' : 'productos'}
      </p>
    </div>
  );
}

interface RowProps {
  category: Category;
  canWrite: boolean;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

interface BodyProps {
  category: Category;
  editing: boolean;
  name: string;
  onName: (value: string) => void;
}

function RowBody({ category, editing, name, onName }: BodyProps) {
  if (!editing) return <Summary category={category} />;
  return (
    <div className="min-w-48 flex-1">
      <Field label="Nombre" value={name} maxLength={60} onChange={(e) => onName(e.target.value)} />
    </div>
  );
}

function CategoryRow({ category, canWrite, onRename, onDelete }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const save = async () => {
    if (await onRename(category.id, name)) setEditing(false);
  };
  return (
    <li className="border-line flex flex-wrap items-center gap-3 border-b p-3 last:border-b-0">
      <RowBody category={category} editing={editing} name={name} onName={setName} />
      {canWrite && editing && (
        <EditActions onSave={() => void save()} onCancel={() => setEditing(false)} />
      )}
      {canWrite && !editing && (
        <ViewActions
          deletable={category.productCount === 0}
          onEdit={() => setEditing(true)}
          onDelete={() => void onDelete(category.id)}
        />
      )}
    </li>
  );
}

type ListProps = Omit<RowProps, 'category'> & { items: Category[] };

function CategoryList({ items, ...rest }: ListProps) {
  return (
    <ul className="border-line bg-surface rounded-xl border">
      {items.map((category) => (
        <CategoryRow key={category.id} category={category} {...rest} />
      ))}
    </ul>
  );
}

export default function CategoriesManager({ canWrite }: { canWrite: boolean }) {
  const { items, error, run } = useCategories();
  const onRename = (id: string, name: string) =>
    run(() => api('PATCH', `catalog/categories/${id}`, { name }));
  const onDelete = (id: string) => run(() => api('DELETE', `catalog/categories/${id}`));
  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {canWrite && (
        <NewCategory onCreate={(name) => run(() => api('POST', 'catalog/categories', { name }))} />
      )}
      {items === null && !error && <p className="text-muted">Cargando…</p>}
      {items?.length === 0 && <EmptyState title="Todavía no hay categorías" />}
      {items && items.length > 0 && (
        <CategoryList items={items} canWrite={canWrite} onRename={onRename} onDelete={onDelete} />
      )}
    </div>
  );
}
