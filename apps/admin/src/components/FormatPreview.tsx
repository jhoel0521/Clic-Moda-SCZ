import type { CSSProperties } from 'react';
import { FORMAT_SIZES, type CropPlan, type FormatName, type Framing } from '../lib/crop';
import { masterUrl, planFor, previewStyle, type MediaItem, type SafeZones } from '../lib/media';

interface Props {
  item: MediaItem;
  format: FormatName;
  framing: Framing;
  zones?: SafeZones | null;
}

const BAND = 'absolute bg-black/45 text-xs font-semibold text-white';

// Zonas que cada app tapa con su interfaz (solo se dibujan aquí, nunca en el archivo descargado).
function SafeZoneOverlay({ zones }: { zones: SafeZones }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className={`${BAND} inset-x-0 top-0 flex items-center justify-center`} style={{ height: `${zones.top}%` }}>
        Arriba {zones.top} %
      </div>
      <div
        className={`${BAND} inset-x-0 bottom-0 flex items-center justify-center`}
        style={{ height: `${zones.bottom}%` }}
      >
        Abajo {zones.bottom} %
      </div>
      <div className={`${BAND} inset-y-0 left-0`} style={{ width: `${zones.sides}%` }} />
      <div className={`${BAND} inset-y-0 right-0`} style={{ width: `${zones.sides}%` }} />
    </div>
  );
}

function frameStyle(format: FormatName, plan: CropPlan): CSSProperties {
  const size = FORMAT_SIZES[format];
  return {
    aspectRatio: `${size.width} / ${size.height}`,
    width: `min(100%, ${((size.width / size.height) * 60).toFixed(1)}vh)`,
    background: plan.fit === 'contain' ? plan.background : '#e5e5e5',
  };
}

function CroppedPhoto({ item, format, plan }: { item: MediaItem; format: FormatName; plan: CropPlan }) {
  return (
    <img
      src={masterUrl(item.id)}
      alt={`Vista previa ${format}: ${item.alt}`}
      width={item.width}
      height={item.height}
      draggable={false}
      style={previewStyle(plan, item, format)}
    />
  );
}

// Recuadro con la proporción del formato mostrando EXACTAMENTE el recorte que generará la API.
export default function FormatPreview({ item, format, framing, zones }: Props) {
  const size = FORMAT_SIZES[format];
  const plan = planFor(item, format, framing);
  return (
    <figure className="flex flex-col items-center gap-2">
      <div
        data-testid="format-preview"
        className="border-line relative overflow-hidden rounded-xl border"
        style={frameStyle(format, plan)}
      >
        <CroppedPhoto item={item} format={format} plan={plan} />
        {zones && <SafeZoneOverlay zones={zones} />}
      </div>
      <figcaption className="text-muted text-sm">
        {size.width} × {size.height} px
      </figcaption>
    </figure>
  );
}
