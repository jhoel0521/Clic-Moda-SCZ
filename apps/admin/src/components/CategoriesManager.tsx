import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/client-api';
import { errorMessage, type Category } from '../lib/types';
import Icon from './Icon';
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, IconButton } from './ui';

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
  const submit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (await onCreate(name)) setName('');
  };
  return (
    <Card className="p-4">
      <form onSubmit={(event) => void submit(event)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Field
            label="Nueva categoría"
            placeholder="Ej: Vestidos"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" icon="plus" disabled={name.trim().length < 2}>
          Agregar
        </Button>
      </form>
    </Card>
  );
}

interface RowProps {
  category: Category;
  canWrite: boolean;
  onRename: (id: string, name: string) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
}

function Summary({ category }: { category: Category }) {
  const count = category.productCount;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <span className="bg-tint text-action flex size-11 shrink-0 items-center justify-center rounded-xl">
        <Icon name="tag" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold">{category.name}</p>
        <Badge tone={count > 0 ? 'brand' : 'neutral'}>
          {count} {count === 1 ? 'producto' : 'productos'}
        </Badge>
      </div>
    </div>
  );
}

function RowActions(props: { deletable: boolean; onEdit: () => void; onDelete: () => void }) {
  const confirmDelete = () => window.confirm('¿Borrar esta categoría?') && props.onDelete();
  const deleteLabel = props.deletable ? 'Borrar categoría' : 'No se puede borrar: tiene productos';
  return (
    <div className="flex shrink-0">
      <IconButton icon="pencil" label="Editar categoría" onClick={props.onEdit} />
      <IconButton icon="trash" label={deleteLabel} tone="danger" disabled={!props.deletable} onClick={confirmDelete} />
    </div>
  );
}

interface EditorProps {
  name: string;
  onName: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

function Editor({ name, onName, onSave, onCancel }: EditorProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <Field label="Nombre" value={name} maxLength={60} onChange={(e) => onName(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onSave}>Guardar</Button>
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

function CategoryRow({ category, canWrite, onRename, onDelete }: RowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const save = async () => {
    if (await onRename(category.id, name)) setEditing(false);
  };
  if (editing) {
    return <Editor name={name} onName={setName} onSave={() => void save()} onCancel={() => setEditing(false)} />;
  }
  return (
    <>
      <Summary category={category} />
      {canWrite && (
        <RowActions
          deletable={category.productCount === 0}
          onEdit={() => setEditing(true)}
          onDelete={() => void onDelete(category.id)}
        />
      )}
    </>
  );
}

interface ListProps {
  items: Category[];
  canWrite: boolean;
  onRename: RowProps['onRename'];
  onDelete: RowProps['onDelete'];
}

function CategoryList({ items, ...rest }: ListProps) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((category) => (
        <li key={category.id}>
          <Card className="flex items-center gap-2 p-3">
            <CategoryRow category={category} {...rest} />
          </Card>
        </li>
      ))}
    </ul>
  );
}

function Content({ items, ...rest }: Omit<ListProps, 'items'> & { items: Category[] | null }) {
  if (items === null) return <p className="text-muted">Cargando…</p>;
  if (items.length === 0) return <EmptyState title="Todavía no hay categorías" icon="tag" />;
  return <CategoryList items={items} {...rest} />;
}

export default function CategoriesManager({ canWrite }: { canWrite: boolean }) {
  const { items, error, run } = useCategories();
  const onRename = (id: string, name: string) => run(() => api('PATCH', `catalog/categories/${id}`, { name }));
  const onDelete = (id: string) => run(() => api('DELETE', `catalog/categories/${id}`));
  return (
    <div className="flex flex-col gap-4">
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {canWrite && <NewCategory onCreate={(name) => run(() => api('POST', 'catalog/categories', { name }))} />}
      <Content items={items} canWrite={canWrite} onRename={onRename} onDelete={onDelete} />
    </div>
  );
}
