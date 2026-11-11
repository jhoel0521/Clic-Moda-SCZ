import type { FieldIssue } from './client-api';

// Forma de GET /store-settings (lo que ve cualquier visitante) y del formulario del Gerente.
export interface ImageRef {
  mediaId: string;
  path: string;
  alt: string;
}

export interface SettingsData {
  brandName: string;
  tagline: string;
  color: { primary: string; dark: string; light: string; soft: string; onPrimary: string };
  logo: ImageRef | null;
  seo: { title: string; description: string; shareImage: (ImageRef & { width: number; height: number }) | null };
  contact: { whatsapp: string; address: string; pickupHours: string; mapUrl: string | null };
  social: { instagram: string | null; tiktok: string | null; facebook: string | null };
  updatedAt: string;
}

export interface SettingsForm {
  brandName: string;
  tagline: string;
  brandColor: string;
  logoMediaId: string | null;
  seoTitle: string;
  seoDescription: string;
  shareMediaId: string | null;
  whatsapp: string;
  address: string;
  pickupHours: string;
  mapUrl: string;
  instagram: string;
  tiktok: string;
  facebook: string;
}

export type FieldName = keyof SettingsForm | 'logo' | 'shareImage';
export type Errors = Partial<Record<FieldName, string>>;

// Mismos límites que valida la API (el servidor siempre vuelve a validar).
export const LIMITS = {
  brandName: [2, 24],
  tagline: [0, 60],
  seoTitle: [10, 60],
  seoDescription: [70, 160],
  address: [0, 160],
  pickupHours: [0, 120],
} as const;

export const toForm = (data: SettingsData): SettingsForm => ({
  brandName: data.brandName,
  tagline: data.tagline,
  brandColor: data.color.primary,
  logoMediaId: data.logo?.mediaId ?? null,
  seoTitle: data.seo.title,
  seoDescription: data.seo.description,
  shareMediaId: data.seo.shareImage?.mediaId ?? null,
  whatsapp: data.contact.whatsapp,
  address: data.contact.address,
  pickupHours: data.contact.pickupHours,
  mapUrl: data.contact.mapUrl ?? '',
  instagram: data.social.instagram ?? '',
  tiktok: data.social.tiktok ?? '',
  facebook: data.social.facebook ?? '',
});

const blankToNull = (value: string): string | null => (value.trim() ? value.trim() : null);

// Cuerpo del PUT: los opcionales vacíos viajan como null.
export const toBody = (form: SettingsForm) => ({
  ...form,
  mapUrl: blankToNull(form.mapUrl),
  instagram: blankToNull(form.instagram),
  tiktok: blankToNull(form.tiktok),
  facebook: blankToNull(form.facebook),
});

const lengthRule =
  (label: string, [min, max]: readonly [number, number]) =>
  (value: string) => {
    const size = value.trim().length;
    if (size >= min && size <= max) return null;
    return min === 0 ? `${label}: hasta ${max} caracteres` : `${label}: entre ${min} y ${max} caracteres`;
  };

const RULES: Partial<Record<keyof SettingsForm, (value: string) => string | null>> = {
  brandName: lengthRule('El nombre', LIMITS.brandName),
  tagline: lengthRule('El eslogan', LIMITS.tagline),
  seoTitle: lengthRule('El título', LIMITS.seoTitle),
  seoDescription: lengthRule('La descripción', LIMITS.seoDescription),
  address: lengthRule('La dirección', LIMITS.address),
  pickupHours: lengthRule('El horario', LIMITS.pickupHours),
  whatsapp: (v) =>
    /^[1-9]\d{9,14}$/.test(v.trim()) ? null : 'Escribe de 10 a 15 dígitos con código de país, p. ej. 59171234567',
};

// Avisos que se pueden dar al escribir, sin esperar a la API.
export function validateForm(form: SettingsForm): Errors {
  const errors: Errors = {};
  for (const [field, rule] of Object.entries(RULES)) {
    const message = rule(String(form[field as keyof SettingsForm]));
    if (message) errors[field as keyof SettingsForm] = message;
  }
  return errors;
}

// Errores por campo que devuelve la API (HTTP 422).
export function issuesToErrors(issues: FieldIssue[]): Errors {
  const errors: Errors = {};
  for (const issue of issues) errors[issue.field as FieldName] ??= issue.message;
  return errors;
}

// Dónde se pega un enlace de WhatsApp de prueba (los botones de la tienda usan este mismo formato).
export const whatsappLink = (number: string, text = ''): string =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
