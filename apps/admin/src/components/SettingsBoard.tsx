import { useState, type ReactNode } from 'react';
import { ApiError, api } from '../lib/client-api';
import {
  LIMITS,
  issuesToErrors,
  toBody,
  toForm,
  validateForm,
  type Errors,
  type SettingsData,
  type SettingsForm,
} from '../lib/settings';
import { errorMessage } from '../lib/types';
import ColorField from './ColorField';
import ImagePicker, { useMediaList, type MediaList } from './ImagePicker';
import StorePreview from './StorePreview';
import { Button, Card, ErrorBanner, Field } from './ui';

type Patch = (change: Partial<SettingsForm>) => void;
type TextKey = Exclude<keyof SettingsForm, 'logoMediaId' | 'shareMediaId' | 'brandColor'>;

const counter = (value: string, max: number): string => `${value.trim().length} de ${max} caracteres`;

function useSettingsForm(initial: SettingsData) {
  const [form, setForm] = useState(() => toForm(initial));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const patch: Patch = (change) => setForm((current) => ({ ...current, ...change }));
  const save = async () => {
    const problems = validateForm(form);
    setErrors(problems);
    if (Object.keys(problems).length) return setMessage({ ok: false, text: 'Revisa los campos marcados' });
    setBusy(true);
    try {
      setForm(toForm(await api<SettingsData>('PUT', 'store-settings', toBody(form))));
      setMessage({ ok: true, text: 'Guardado. La tienda lo muestra en menos de un minuto' });
    } catch (failure) {
      setErrors(failure instanceof ApiError ? issuesToErrors(failure.issues) : {});
      setMessage({ ok: false, text: errorMessage(failure) });
    } finally {
      setBusy(false);
    }
  };
  return { form, errors, busy, message, patch, save };
}

interface PartProps {
  form: SettingsForm;
  errors: Errors;
  patch: Patch;
}

interface FieldSpec {
  key: TextKey;
  label: string;
  hint?: (form: SettingsForm) => string;
  url?: boolean;
  numeric?: boolean;
}

function Fields({ specs, form, errors, patch }: PartProps & { specs: FieldSpec[] }) {
  return (
    <>
      {specs.map((spec) => (
        <Field
          key={spec.key}
          label={spec.label}
          hint={spec.hint?.(form)}
          type={spec.url ? 'url' : undefined}
          inputMode={spec.numeric ? 'numeric' : undefined}
          error={errors[spec.key]}
          value={form[spec.key]}
          onChange={(e) => patch({ [spec.key]: e.target.value })}
        />
      ))}
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold">{title}</h2>
      {children}
    </Card>
  );
}

const BRAND: FieldSpec[] = [
  { key: 'brandName', label: 'Nombre de la tienda', hint: (f) => counter(f.brandName, LIMITS.brandName[1]) },
  { key: 'tagline', label: 'Eslogan', hint: (f) => counter(f.tagline, LIMITS.tagline[1]) },
];

function BrandSection(props: PartProps & { media: MediaList }) {
  const { form, errors, patch, media } = props;
  return (
    <Section title="Marca">
      <Fields {...props} specs={BRAND} />
      <ColorField value={form.brandColor} error={errors.brandColor} onChange={(brandColor) => patch({ brandColor })} />
      <ImagePicker
        media={media}
        legend="Logo"
        hint="Se ve en la cabecera. Sin logo se muestra el nombre."
        value={form.logoMediaId}
        error={errors.logo}
        onChange={(logoMediaId) => patch({ logoMediaId })}
      />
    </Section>
  );
}

const SEO: FieldSpec[] = [
  { key: 'seoTitle', label: 'Título para buscadores', hint: (f) => counter(f.seoTitle, LIMITS.seoTitle[1]) },
  {
    key: 'seoDescription',
    label: 'Descripción para buscadores',
    hint: (f) => counter(f.seoDescription, LIMITS.seoDescription[1]),
  },
];

function SeoSection(props: PartProps & { media: MediaList }) {
  const { form, errors, patch, media } = props;
  return (
    <Section title="Búsqueda y compartir">
      <Fields {...props} specs={SEO} />
      <ImagePicker
        media={media}
        legend="Imagen al compartir el enlace"
        hint="Se ve en WhatsApp, Facebook y X (formato 1200×630)."
        value={form.shareMediaId}
        error={errors.shareImage}
        onChange={(shareMediaId) => patch({ shareMediaId })}
      />
    </Section>
  );
}

const CONTACT: FieldSpec[] = [
  {
    key: 'whatsapp',
    label: 'WhatsApp',
    hint: () => 'Con código de país, solo dígitos. Ej. 59171234567',
    numeric: true,
  },
  { key: 'address', label: 'Dirección del almacén' },
  { key: 'pickupHours', label: 'Horario de recojo' },
  { key: 'mapUrl', label: 'Enlace del mapa (opcional)', url: true },
];

const SOCIAL: FieldSpec[] = [
  { key: 'instagram', label: 'Instagram', url: true, hint: () => 'Solo enlaces https de instagram.com' },
  { key: 'tiktok', label: 'TikTok', url: true, hint: () => 'Solo enlaces https de tiktok.com' },
  { key: 'facebook', label: 'Facebook', url: true, hint: () => 'Solo enlaces https de facebook.com' },
];

function Feedback({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null;
  if (!message.ok) return <ErrorBanner>{message.text}</ErrorBanner>;
  return (
    <p role="status" className="text-success font-semibold">
      {message.text}
    </p>
  );
}

interface Props {
  initial: SettingsData;
  canWrite: boolean;
}

function Sections({ part, media }: { part: PartProps; media: MediaList }) {
  return (
    <>
      <BrandSection {...part} media={media} />
      <SeoSection {...part} media={media} />
      <Section title="Contacto y recojo">
        <Fields {...part} specs={CONTACT} />
      </Section>
      <Section title="Redes sociales (opcional)">
        <Fields {...part} specs={SOCIAL} />
      </Section>
    </>
  );
}

interface BodyProps {
  state: ReturnType<typeof useSettingsForm>;
  media: MediaList;
  canWrite: boolean;
}

// No es un <form>: el selector de imágenes trae su propio formulario de subida y HTML no admite
// formularios anidados. Guardar es un botón.
function FormBody({ state, media, canWrite }: BodyProps) {
  const part = { form: state.form, errors: state.errors, patch: state.patch };
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Sections part={part} media={media} />
      <Feedback message={state.message} />
      <Button icon="check" disabled={!canWrite || state.busy} onClick={() => void state.save()}>
        {state.busy ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  );
}

// Pantalla de configuración de la tienda: formulario a la izquierda y vista previa a la derecha.
export default function SettingsBoard({ initial, canWrite }: Props) {
  const state = useSettingsForm(initial);
  const media = useMediaList();
  const logo = media.items?.find((item) => item.id === state.form.logoMediaId) ?? null;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
      <FormBody state={state} media={media} canWrite={canWrite} />
      <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
        <StorePreview form={state.form} logo={logo} />
      </div>
    </div>
  );
}
