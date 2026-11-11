import { useEffect, useState } from 'react';
import { api } from '../lib/client-api';
import { variantUrl, type MediaItem } from '../lib/media';
import { errorMessage } from '../lib/types';
import { UploadForm } from './MediaBoard';
import { ErrorBanner } from './ui';

export type MediaList = ReturnType<typeof useMediaList>;

interface Props {
  media: MediaList;
  legend: string;
  hint: string;
  value: string | null;
  onChange: (id: string | null) => void;
  error?: string | null;
}

const CARD =
  'border-border has-[:checked]:border-action has-[:checked]:ring-action has-[:focus-visible]:outline-action has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 relative block cursor-pointer overflow-hidden rounded-xl border has-[:checked]:ring-2';

export function useMediaList() {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  useEffect(() => {
    api<MediaItem[]>('GET', 'media')
      .then(setItems)
      .catch((error: unknown) => setFailure(errorMessage(error)));
  }, []);
  return { items, failure, add: (item: MediaItem) => setItems((all) => [item, ...(all ?? [])]) };
}

interface ChoiceProps {
  name: string;
  checked: boolean;
  onPick: () => void;
}

function Radio({ name, checked, onPick, label }: ChoiceProps & { label?: string }) {
  return <input type="radio" name={name} checked={checked} onChange={onPick} aria-label={label} className="sr-only" />;
}

function Option({ item, ...choice }: ChoiceProps & { item: MediaItem }) {
  return (
    <li>
      <label className={CARD}>
        <Radio {...choice} label={item.alt} />
        <img
          src={variantUrl(item, 'thumb')}
          alt=""
          width={320}
          height={320}
          loading="lazy"
          className="aspect-square w-full object-cover"
        />
      </label>
    </li>
  );
}

function NoImage(choice: ChoiceProps) {
  return (
    <li>
      <label
        className={`${CARD} text-muted flex aspect-square items-center justify-center p-2 text-center text-sm font-medium`}
      >
        <Radio {...choice} />
        Sin imagen
      </label>
    </li>
  );
}

function Grid({ media, name, value, onChange }: Pick<Props, 'media' | 'value' | 'onChange'> & { name: string }) {
  return (
    <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      <NoImage name={name} checked={value === null} onPick={() => onChange(null)} />
      {(media.items ?? []).map((item) => (
        <Option key={item.id} item={item} name={name} checked={value === item.id} onPick={() => onChange(item.id)} />
      ))}
    </ul>
  );
}

const Problem = ({ text }: { text: string }) => (
  <p role="alert" className="text-danger text-sm font-medium">
    {text}
  </p>
);

function NewImage({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  return (
    <details>
      <summary className="text-action flex min-h-12 cursor-pointer items-center font-semibold">
        Subir una imagen nueva
      </summary>
      <UploadForm onUploaded={onUploaded} />
    </details>
  );
}

// Elige una imagen del módulo de medios (o sube una nueva ahí mismo). Guarda solo su identificador.
export default function ImagePicker({ media, legend, hint, value, onChange, error }: Props) {
  const uploaded = (item: MediaItem) => {
    media.add(item);
    onChange(item.id);
  };
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-semibold">{legend}</legend>
      <p className="text-muted text-sm">{hint}</p>
      {media.failure && <ErrorBanner>{media.failure}</ErrorBanner>}
      {media.items === null && !media.failure && <p className="text-muted">Cargando imágenes…</p>}
      <Grid media={media} name={`picker-${legend}`} value={value} onChange={onChange} />
      {error && <Problem text={error} />}
      <NewImage onUploaded={uploaded} />
    </fieldset>
  );
}
