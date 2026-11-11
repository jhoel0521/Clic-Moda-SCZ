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

// Mismos íconos que el pie de la tienda (apps/shop/src/components/SocialIcon.astro).
const GLYPHS = {
  instagram:
    'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01',
  facebook: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  tiktok: 'M9 12a4 4 0 1 0 4 4V3a5 5 0 0 0 5 5',
  whatsapp: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
  contact:
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z',
} as const;

function Glyph({ name }: { name: keyof typeof GLYPHS }) {
  const props = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  } as const;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" {...props}>
      <path d={GLYPHS[name]} />
    </svg>
  );
}

function FooterLinks({ form }: { form: SettingsForm }) {
  const links = [
    form.whatsapp.trim() && { icon: 'whatsapp', label: 'WhatsApp' },
    { icon: 'contact', label: 'Contacto' },
    form.instagram.trim() && { icon: 'instagram', label: 'Instagram' },
    form.tiktok.trim() && { icon: 'tiktok', label: 'TikTok' },
    form.facebook.trim() && { icon: 'facebook', label: 'Facebook' },
  ].filter(Boolean) as { icon: keyof typeof GLYPHS; label: string }[];
  return (
    <ul className="flex flex-wrap gap-x-5" aria-label="Enlaces del pie">
      {links.map((link) => (
        <li
          key={link.label}
          className="inline-flex min-h-12 items-center gap-2 font-semibold underline"
          style={{ color: 'var(--brand-dark)' }}
        >
          <Glyph name={link.icon} />
          {link.label}
        </li>
      ))}
    </ul>
  );
}

// El mapa real lo incrusta la tienda en Contacto; aquí solo se marca dónde va.
function MapBlock({ form }: { form: SettingsForm }) {
  if (!form.mapUrl.trim() && !form.address.trim()) return null;
  return (
    <div className="flex aspect-[4/3] items-center justify-center rounded-xl bg-white/70 px-4 text-center text-xs text-[#6b5a64]">
      Mapa de Google Maps (se muestra en la página de Contacto)
    </div>
  );
}

function Footer({ form }: { form: SettingsForm }) {
  return (
    <footer
      className="flex flex-col gap-2 px-4 py-4 text-sm text-[#24151c]"
      style={{ background: 'var(--brand-soft)' }}
    >
      <p className="font-bold">{form.brandName || 'Nombre de la tienda'}</p>
      <p className="font-semibold">{form.address || 'Dirección del almacén'}</p>
      <p>{form.pickupHours || 'Horario de recojo'}</p>
      <FooterLinks form={form} />
      <MapBlock form={form} />
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
        className="overflow-x-auto rounded-xl border border-neutral-200"
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
