import { useState } from 'react';
import { api } from '../lib/client-api';
import type { FormatName, Framing } from '../lib/crop';
import { DEFAULT_SAFE_ZONES, SHARE_FORMATS, framingOf, warnings, type MediaItem, type SafeZones } from '../lib/media';
import { errorMessage } from '../lib/types';
import FocalPicker from './FocalPicker';
import FormatPreview from './FormatPreview';
import Icon from './Icon';
import { Button, ErrorBanner, Field, SelectField } from './ui';

function FormatPicker({ value, onChange }: { value: FormatName; onChange: (format: FormatName) => void }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold">Formato</legend>
      <div className="grid grid-cols-2 gap-2">
        {SHARE_FORMATS.map((format) => (
          <label
            key={format.name}
            className="border-border has-[:checked]:border-action has-[:checked]:bg-tint has-[:focus-visible]:outline-action flex min-h-12 cursor-pointer flex-col justify-center rounded-xl border px-3 py-2 has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2"
          >
            <input
              type="radio"
              name="formato"
              className="sr-only"
              checked={value === format.name}
              onChange={() => onChange(format.name)}
            />
            <span className="font-semibold">{format.label}</span>
            <span className="text-muted text-xs">{format.usage}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function WarningList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <ul role="status" className="flex flex-col gap-2">
      {items.map((text) => (
        <li key={text} className="text-warning flex items-start gap-2 text-sm font-medium">
          <Icon name="alert" className="mt-0.5 size-5 shrink-0" />
          {text}
        </li>
      ))}
    </ul>
  );
}

interface FitProps {
  framing: Framing;
  disabled: boolean;
  onChange: (framing: Framing) => void;
}

function FitControls({ framing, disabled, onChange }: FitProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <SelectField
        label="Encuadre"
        value={framing.fit}
        disabled={disabled}
        onChange={(e) => onChange({ ...framing, fit: e.target.value as Framing['fit'] })}
        options={[
          { value: 'cover', label: 'Recortar para llenar el formato' },
          { value: 'contain', label: 'Foto completa con fondo' },
        ]}
      />
      {framing.fit === 'contain' && (
        <Field
          label="Color de fondo"
          type="color"
          value={framing.background}
          disabled={disabled}
          onChange={(e) => onChange({ ...framing, background: e.target.value })}
        />
      )}
    </div>
  );
}

interface ZoneProps {
  zones: SafeZones;
  onChange: (zones: SafeZones) => void;
}

function ZoneControls({ zones, onChange }: ZoneProps) {
  const field = (key: keyof SafeZones, label: string) => (
    <Field
      label={label}
      type="number"
      inputMode="numeric"
      min={0}
      max={45}
      value={zones[key]}
      onChange={(e) => onChange({ ...zones, [key]: Math.min(45, Math.max(0, Number(e.target.value) || 0)) })}
    />
  );
  return (
    <div className="grid grid-cols-3 gap-3">
      {field('top', 'Arriba %')}
      {field('bottom', 'Abajo %')}
      {field('sides', 'Lados %')}
    </div>
  );
}

const sameFraming = (a: Framing, b: Framing): boolean =>
  a.focalX === b.focalX && a.focalY === b.focalY && a.fit === b.fit && a.background === b.background;

function useSave(item: MediaItem, framing: Framing, onSaved: (item: MediaItem) => void) {
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      onSaved(await api<MediaItem>('PATCH', `media/${item.id}/framing`, framing));
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  };
  return { error, saving, save };
}

interface BodyProps {
  item: MediaItem;
  canWrite: boolean;
  framing: Framing;
  setFraming: (framing: Framing) => void;
}

// Enfoque (solo si se recorta) y encuadre: lo que el Gerente puede cambiar.
function FramingControls({ item, canWrite, framing, setFraming }: BodyProps) {
  return (
    <>
      {framing.fit === 'cover' && (
        <FocalPicker
          item={item}
          focal={{ x: framing.focalX, y: framing.focalY }}
          disabled={!canWrite}
          onChange={(focal) => setFraming({ ...framing, focalX: focal.x, focalY: focal.y })}
        />
      )}
      <FitControls framing={framing} disabled={!canWrite} onChange={setFraming} />
    </>
  );
}

interface Props {
  item: MediaItem;
  canWrite: boolean;
  onSaved: (item: MediaItem) => void;
}

export default function FramingEditor({ item, canWrite, onSaved }: Props) {
  const [framing, setFraming] = useState<Framing>(framingOf(item));
  const [format, setFormat] = useState<FormatName>('link');
  const [zones, setZones] = useState(DEFAULT_SAFE_ZONES);
  const { error, saving, save } = useSave(item, framing, onSaved);
  const disabled = sameFraming(framing, framingOf(item)) || saving;
  return (
    <div className="flex flex-col gap-4">
      <FormatPicker value={format} onChange={setFormat} />
      <FormatPreview item={item} format={format} framing={framing} zones={format === 'story' ? zones : null} />
      <WarningList items={warnings(item, format, framing)} />
      {format === 'story' && <ZoneControls zones={zones} onChange={setZones} />}
      <FramingControls item={item} canWrite={canWrite} framing={framing} setFraming={setFraming} />
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {canWrite && (
        <Button icon="check" disabled={disabled} onClick={() => void save()}>
          {saving ? 'Guardando…' : 'Guardar encuadre'}
        </Button>
      )}
    </div>
  );
}
