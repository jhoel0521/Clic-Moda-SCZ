import { useEffect, useState } from 'react';
import { ApiError, api } from '../lib/client-api';
import { variantUrl, type MediaItem } from '../lib/media';
import { MAX_PHOTOS, append, isDirty, move, movedMessage, photoErrors, remove } from '../lib/photos';
import { errorMessage } from '../lib/types';
import { useMediaList, type MediaList } from './ImagePicker';
import { UploadForm } from './MediaBoard';
import { Badge, Button, Card, ErrorBanner, IconButton } from './ui';

interface ProductWithPhotos {
  photos: string[];
}

// Carga las fotos guardadas del producto: `saved` es lo que hay en la API y `current` lo que se está editando.
function useLoadedPhotos(productId: string) {
  const [saved, setSaved] = useState<string[] | null>(null);
  const [current, setCurrent] = useState<string[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  useEffect(() => {
    api<ProductWithPhotos>('GET', `catalog/products/${productId}`)
      .then((product) => {
        setSaved(product.photos);
        setCurrent(product.photos);
      })
      .catch((error: unknown) => setProblems([errorMessage(error)]));
  }, [productId]);
  const reset = (photos: string[]) => {
    setSaved(photos);
    setCurrent(photos);
  };
  return { saved, current, setCurrent, problems, setProblems, reset };
}

function usePhotos(productId: string) {
  const loaded = useLoadedPhotos(productId);
  const [announce, setAnnounce] = useState('');
  const [busy, setBusy] = useState(false);
  const change = (next: string[], message = '') => {
    loaded.setCurrent(next);
    setAnnounce(message);
  };
  const save = async () => {
    setBusy(true);
    loaded.setProblems([]);
    try {
      const url = `catalog/products/${productId}/photos`;
      loaded.reset((await api<ProductWithPhotos>('PUT', url, { mediaIds: loaded.current })).photos);
      setAnnounce('Fotos guardadas');
    } catch (failure) {
      const issues = failure instanceof ApiError ? failure.issues : [];
      loaded.setProblems(issues.length ? photoErrors(issues) : [errorMessage(failure)]);
    } finally {
      setBusy(false);
    }
  };
  return { ...loaded, announce, busy, change, save };
}

type PhotosState = ReturnType<typeof usePhotos>;

function PhotoActions({ item, index, total, state }: RowProps) {
  const shift = (delta: -1 | 1) =>
    state.change(move(state.current, index, delta), movedMessage(index + 1 + delta, total));
  const drop = () => state.change(remove(state.current, item.id), `Foto quitada: ${item.alt}`);
  return (
    <>
      <IconButton icon="up" label={`Subir la foto ${item.alt}`} disabled={index === 0} onClick={() => shift(-1)} />
      <IconButton
        icon="down"
        label={`Bajar la foto ${item.alt}`}
        disabled={index === total - 1}
        onClick={() => shift(1)}
      />
      <IconButton icon="trash" label={`Quitar la foto ${item.alt} del producto`} onClick={drop} />
    </>
  );
}

interface RowProps {
  item: MediaItem;
  index: number;
  total: number;
  state: PhotosState;
}

function PhotoRow(props: RowProps) {
  const { item, index } = props;
  return (
    <li className="border-line flex items-center gap-3 rounded-xl border p-2">
      <img
        src={variantUrl(item, 'thumb')}
        alt=""
        width={320}
        height={320}
        className="size-16 shrink-0 rounded-lg object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{item.alt}</p>
        {index === 0 ? (
          <Badge tone="brand">Principal</Badge>
        ) : (
          <span className="text-muted text-sm">Foto {index + 1}</span>
        )}
      </div>
      <PhotoActions {...props} />
    </li>
  );
}

function Chosen({ media, state }: { media: MediaList; state: PhotosState }) {
  const items = state.current.flatMap((id) => media.items?.find((item) => item.id === id) ?? []);
  if (items.length === 0) return <p className="text-muted">Este producto todavía no tiene fotos.</p>;
  return (
    <ol className="flex flex-col gap-2" aria-label="Fotos del producto">
      {items.map((item, index) => (
        <PhotoRow key={item.id} item={item} index={index} total={items.length} state={state} />
      ))}
    </ol>
  );
}

function AddButton({ item, state, full }: { item: MediaItem; state: PhotosState; full: boolean }) {
  const add = () => state.change(append(state.current, item.id), `Foto agregada: ${item.alt}`);
  return (
    <button
      type="button"
      disabled={full}
      aria-label={`Agregar la foto ${item.alt}`}
      onClick={add}
      className="border-border block w-full overflow-hidden rounded-xl border disabled:opacity-40"
    >
      <img
        src={variantUrl(item, 'thumb')}
        alt=""
        width={320}
        height={320}
        loading="lazy"
        className="aspect-square w-full object-cover"
      />
    </button>
  );
}

function Available({ media, state }: { media: MediaList; state: PhotosState }) {
  const free = (media.items ?? []).filter((item) => !state.current.includes(item.id));
  if (free.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">Agregar desde las imágenes</h3>
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {free.map((item) => (
          <li key={item.id}>
            <AddButton item={item} state={state} full={state.current.length >= MAX_PHOTOS} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Problems({ problems }: { problems: string[] }) {
  return (
    <>
      {problems.map((text) => (
        <ErrorBanner key={text}>{text}</ErrorBanner>
      ))}
    </>
  );
}

function UploadNew({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  return (
    <details>
      <summary className="text-action flex min-h-12 cursor-pointer items-center font-semibold">
        Subir una imagen nueva
      </summary>
      <UploadForm onUploaded={onUploaded} />
    </details>
  );
}

function Intro() {
  return (
    <>
      <h2 className="text-lg font-bold">Fotos</h2>
      <p className="text-muted text-sm">
        La primera es la principal (hasta {MAX_PHOTOS}). Quitar una foto del producto no borra la imagen: sigue en
        Imágenes.
      </p>
    </>
  );
}

// Fotos del producto: elegir del módulo de imágenes, ordenar (la primera es la principal) y guardar.
// Va FUERA del formulario del producto (la subida trae su propio formulario y HTML no admite anidarlos).
export default function ProductPhotos({ productId }: { productId: string }) {
  const state = usePhotos(productId);
  const media = useMediaList();
  const dirty = state.saved !== null && isDirty(state.current, state.saved);
  const uploaded = (item: MediaItem) => {
    media.add(item);
    state.change(append(state.current, item.id), `Foto agregada: ${item.alt}`);
  };
  return (
    <Card className="flex flex-col gap-4 p-4">
      <Intro />
      <div role="status" aria-live="polite" className="sr-only">
        {state.announce}
      </div>
      <Problems problems={state.problems} />
      <Chosen media={media} state={state} />
      <Available media={media} state={state} />
      <UploadNew onUploaded={uploaded} />
      <Button disabled={!dirty || state.busy} icon="check" onClick={() => void state.save()}>
        {state.busy ? 'Guardando…' : 'Guardar fotos'}
      </Button>
    </Card>
  );
}
