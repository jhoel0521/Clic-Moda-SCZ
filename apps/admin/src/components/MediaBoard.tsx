import { useCallback, useEffect, useState } from 'react';
import { api, apiUpload } from '../lib/client-api';
import { variantUrl, type MediaItem } from '../lib/media';
import { errorMessage } from '../lib/types';
import FramingEditor from './FramingEditor';
import ShareCards from './ShareCards';
import ShareKit from './ShareKit';
import { Badge, Button, Card, EmptyState, ErrorBanner, Field, IconButton, SelectField } from './ui';

const MAX_BYTES = 12 * 1024 * 1024;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Valida lo que se puede saber sin llamar a la API; la API vuelve a validar todo por los bytes.
export function uploadProblem(file: File | null, alt: string): string | null {
  if (!file) return 'Elige una foto';
  if (!TYPES.includes(file.type)) return 'La foto debe ser JPG, PNG o WebP';
  if (file.size > MAX_BYTES) return 'La foto pesa más de 12 MB';
  return alt.trim() ? null : 'Escribe el texto alternativo de la foto';
}

function buildForm(file: File, alt: string, fit: string): FormData {
  const form = new FormData();
  form.set('file', file);
  form.set('alt', alt);
  form.set('fit', fit);
  return form;
}

function useUpload(onUploaded: (item: MediaItem) => void) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState('');
  const [fit, setFit] = useState('cover');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (event: { preventDefault: () => void }) => {
    event.preventDefault();
    const problem = uploadProblem(file, alt);
    if (problem || !file) return setError(problem);
    setBusy(true);
    try {
      onUploaded(await apiUpload<MediaItem>('media', buildForm(file, alt, fit)));
      setAlt('');
      setError(null);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setBusy(false);
    }
  };
  return { alt, setAlt, fit, setFit, setFile, error, busy, submit };
}

const FIT_OPTIONS = [
  { value: 'cover', label: 'Recortar para llenar el formato' },
  { value: 'contain', label: 'Foto completa con fondo (logos)' },
];

type UploadState = ReturnType<typeof useUpload>;

function UploadFields({ form }: { form: UploadState }) {
  const pick = (e: { target: { files: FileList | null } }) => form.setFile(e.target.files?.[0] ?? null);
  const hint = 'Describe la foto (accesibilidad y al compartir)';
  return (
    <>
      <Field label="Foto" type="file" accept={TYPES.join(',')} onChange={pick} />
      <Field
        label="Texto alternativo"
        hint={hint}
        value={form.alt}
        maxLength={125}
        onChange={(e) => form.setAlt(e.target.value)}
      />
      <SelectField
        label="Encuadre inicial"
        value={form.fit}
        onChange={(e) => form.setFit(e.target.value)}
        options={FIT_OPTIONS}
      />
    </>
  );
}

export function UploadForm({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  const form = useUpload(onUploaded);
  return (
    <Card className="p-4">
      <form onSubmit={(event) => void form.submit(event)} className="flex flex-col gap-3">
        <UploadFields form={form} />
        {form.error && <ErrorBanner>{form.error}</ErrorBanner>}
        <Button type="submit" icon="plus" disabled={form.busy}>
          {form.busy ? 'Subiendo…' : 'Subir imagen'}
        </Button>
      </form>
    </Card>
  );
}

interface GridProps {
  items: MediaItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function MediaGrid({ items, selectedId, onSelect }: GridProps) {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            aria-label={`Abrir ${item.alt}`}
            aria-pressed={item.id === selectedId}
            onClick={() => onSelect(item.id)}
            className="border-border aria-pressed:border-action aria-pressed:ring-action block w-full overflow-hidden rounded-xl border aria-pressed:ring-2"
          >
            <img src={variantUrl(item, 'thumb')} alt="" loading="lazy" className="aspect-square w-full object-cover" />
          </button>
        </li>
      ))}
    </ul>
  );
}

interface DetailProps {
  item: MediaItem;
  canWrite: boolean;
  host: string;
  onChange: (item: MediaItem) => void;
  onDelete: (id: string) => void;
}

function DetailHeader({ item, canWrite, onDelete }: Pick<DetailProps, 'item' | 'canWrite' | 'onDelete'>) {
  const remove = () =>
    window.confirm('¿Borrar esta imagen? Los enlaces ya compartidos dejarán de mostrarla.') && onDelete(item.id);
  return (
    <Card className="flex items-center gap-2 p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{item.alt}</p>
        <Badge tone="brand">Revisión {item.revision}</Badge>
      </div>
      {canWrite && <IconButton icon="trash" label="Borrar imagen" tone="danger" onClick={remove} />}
    </Card>
  );
}

function MediaDetail({ item, canWrite, host, onChange, onDelete }: DetailProps) {
  return (
    <div className="flex flex-col gap-4">
      <DetailHeader item={item} canWrite={canWrite} onDelete={onDelete} />
      <Card className="p-4">
        <FramingEditor key={`${item.id}-${item.revision}`} item={item} canWrite={canWrite} onSaved={onChange} />
      </Card>
      <ShareCards key={`cards-${item.id}-${item.revision}`} item={item} host={host} />
      <ShareKit item={item} />
    </div>
  );
}

// Lista, selección y acciones sobre las imágenes (la API es la única fuente de verdad).
function useMedia() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    api<MediaItem[]>('GET', 'media').then(setItems, (failure: unknown) => setError(errorMessage(failure)));
  }, []);
  const replace = useCallback((item: MediaItem) => {
    setItems((current) => (current ?? []).map((existing) => (existing.id === item.id ? item : existing)));
  }, []);
  const add = (item: MediaItem) => {
    setItems((current) => [item, ...(current ?? [])]);
    setSelectedId(item.id);
  };
  const remove = (id: string) =>
    api('DELETE', `media/${id}`).then(
      () => {
        setItems((current) => (current ?? []).filter((item) => item.id !== id));
        setSelectedId(null);
      },
      (failure: unknown) => setError(errorMessage(failure))
    );
  const selected = items?.find((item) => item.id === selectedId) ?? null;
  return { items, selected, selectedId, setSelectedId, error, replace, add, remove };
}

function MediaList({ items, ...rest }: Omit<GridProps, 'items'> & { items: MediaItem[] | null; error: string | null }) {
  if (items === null) return rest.error ? null : <p className="text-muted">Cargando…</p>;
  if (items.length === 0) return <EmptyState title="Todavía no hay imágenes" icon="image" />;
  return <MediaGrid items={items} selectedId={rest.selectedId} onSelect={rest.onSelect} />;
}

export default function MediaBoard({ canWrite, host }: { canWrite: boolean; host: string }) {
  const media = useMedia();
  return (
    <div className="flex flex-col gap-4">
      {media.error && <ErrorBanner>{media.error}</ErrorBanner>}
      {canWrite && <UploadForm onUploaded={media.add} />}
      <MediaList items={media.items} selectedId={media.selectedId} onSelect={media.setSelectedId} error={media.error} />
      {media.selected && (
        <MediaDetail
          item={media.selected}
          canWrite={canWrite}
          host={host}
          onChange={media.replace}
          onDelete={(id) => void media.remove(id)}
        />
      )}
    </div>
  );
}
