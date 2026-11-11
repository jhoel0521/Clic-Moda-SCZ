import { useState } from 'react';
import type { FormatName } from '../lib/crop';
import { SHARE_FORMATS, variantUrl, type MediaItem } from '../lib/media';
import Icon from './Icon';
import { Button, Card, ErrorBanner } from './ui';

// ¿Puede este navegador compartir archivos con el menú del sistema (Web Share, sobre todo en celulares)?
export function canShareFiles(): boolean {
  if (typeof navigator === 'undefined' || !navigator.share || !navigator.canShare) return false;
  return navigator.canShare({ files: [new File([], 'prueba.jpg', { type: 'image/jpeg' })] });
}

async function shareFile(item: MediaItem, format: FormatName): Promise<void> {
  const response = await fetch(variantUrl(item, format));
  if (!response.ok) throw new Error('No se pudo preparar la imagen');
  const blob = await response.blob();
  const file = new File([blob], `${item.id}-${format}.jpg`, { type: blob.type || 'image/jpeg' });
  await navigator.share({ files: [file], title: item.alt });
}

interface RowProps {
  item: MediaItem;
  name: FormatName;
  label: string;
  usage: string;
  onError: (message: string) => void;
}

function KitRow({ item, name, label, usage, onError }: RowProps) {
  const share = () => shareFile(item, name).catch((e: Error) => e.name !== 'AbortError' && onError(e.message));
  return (
    <li className="flex flex-wrap items-center gap-2">
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-muted text-sm">{usage}</p>
      </div>
      <a
        href={variantUrl(item, name)}
        download={`${item.id}-${name}.jpg`}
        aria-label={`Descargar ${label}`}
        className="bg-surface border-border hover:bg-hover inline-flex min-h-12 items-center gap-2 rounded-xl border px-4 font-semibold"
      >
        <Icon name="download" />
        Descargar
      </a>
      {canShareFiles() && (
        <Button variant="secondary" icon="share" aria-label={`Compartir ${label}`} onClick={() => void share()}>
          Compartir
        </Button>
      )}
    </li>
  );
}

// Los estados, historias y reels no leen etiquetas de enlace: se suben a mano con estos archivos.
export default function ShareKit({ item }: { item: MediaItem }) {
  const [error, setError] = useState<string | null>(null);
  return (
    <Card className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-bold">Kit para compartir</h2>
      <p className="text-muted text-sm">
        Descarga cada formato limpio (sin guías) y súbelo a mano a tu estado, historia o publicación.
      </p>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      <ul className="flex flex-col gap-4">
        {SHARE_FORMATS.map((format) => (
          <KitRow key={format.name} item={item} {...format} onError={setError} />
        ))}
      </ul>
    </Card>
  );
}
