import { useState, type CSSProperties } from 'react';
import { checkContrast, derivePalette } from '../lib/palette';
import { variantUrl, type MediaItem } from '../lib/media';
import type { SettingsForm } from '../lib/settings';
import { Card } from './ui';

interface Props {
  form: SettingsForm;
  logo: MediaItem | null;
}

const SIZES = [
  { value: 360, label: 'Móvil 360 px' },
  { value: 1280, label: 'Escritorio 1280 px' },
] as const;

// Colores de la marca como variables CSS, igual que hará la tienda. Un color inválido no rompe la vista.
function brandVars(color: string): CSSProperties {
  const palette = derivePalette(checkContrast(color).ok ? color : '#c7305a');
  return {
    '--brand': palette.primary,
    '--brand-dark': palette.dark,
    '--brand-soft': palette.soft,
    '--on-brand': palette.onPrimary,
  } as CSSProperties;
}

function Header({ form, logo }: Props) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-neutral-200 bg-white px-4 py-3">
      {logo ? (
        <img
          src={variantUrl(logo, 'logo')}
          alt={form.brandName}
          width={160}
          height={80}
          className="h-10 w-auto max-w-[60%] object-contain"
        />
      ) : (
        <span className="min-w-0 truncate text-lg font-bold" style={{ color: 'var(--brand-dark)' }}>
          {form.brandName || 'Nombre de la tienda'}
        </span>
      )}
      <span
        className="shrink-0 rounded-full px-3 py-1 text-sm font-semibold"
        style={{ background: 'var(--brand-soft)', color: '#24151c' }}
      >
        Catálogo
      </span>
    </header>
  );
}

function Body({ form }: { form: SettingsForm }) {
  return (
    <section className="flex flex-col items-start gap-3 bg-white px-4 py-6">
      <h3 className="text-2xl font-bold text-[#24151c]">{form.brandName || 'Nombre de la tienda'}</h3>
      <p className="text-[#6b5a64]">{form.tagline || 'Tu eslogan aparece aquí'}</p>
      <span
        className="inline-flex min-h-12 items-center rounded-xl px-5 font-semibold"
        style={{ background: 'var(--brand)', color: 'var(--on-brand)' }}
      >
        Escribir por WhatsApp
      </span>
    </section>
  );
}

function Footer({ form }: { form: SettingsForm }) {
  return (
    <footer
      className="flex flex-col gap-1 px-4 py-4 text-sm text-[#24151c]"
      style={{ background: 'var(--brand-soft)' }}
    >
      <p className="font-semibold">{form.address || 'Dirección del almacén'}</p>
      <p>{form.pickupHours || 'Horario de recojo'}</p>
    </footer>
  );
}

function SizeToggle({ size, onChange }: { size: number; onChange: (size: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Tamaño de la vista previa" className="flex flex-wrap gap-2">
      {SIZES.map((option) => (
        <label
          key={option.value}
          className="border-border has-[:checked]:border-action has-[:checked]:bg-tint has-[:focus-visible]:outline-action flex min-h-12 cursor-pointer items-center rounded-xl border px-4 font-medium has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2"
        >
          <input
            type="radio"
            name="preview-size"
            className="sr-only"
            checked={size === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

// Cómo se vería la tienda con estos datos, a 360 px y a 1280 px, sin tocar la tienda pública.
export default function StorePreview({ form, logo }: Props) {
  const [size, setSize] = useState<number>(360);
  const scale = size === 1280 ? 0.3 : 1;
  return (
    <Card className="flex flex-col gap-3 p-4">
      <h2 className="text-lg font-bold">Vista previa</h2>
      <SizeToggle size={size} onChange={setSize} />
      <div
        className="overflow-hidden rounded-xl border border-neutral-200"
        aria-label={`Vista previa a ${size} píxeles`}
      >
        <div style={{ width: size, zoom: scale, ...brandVars(form.brandColor) }} data-testid="preview-frame">
          <Header form={form} logo={logo} />
          <Body form={form} />
          <Footer form={form} />
        </div>
      </div>
    </Card>
  );
}
