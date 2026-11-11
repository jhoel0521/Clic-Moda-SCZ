import { apiBase } from './api-server';

// Configuración pública de la tienda (GET /store-settings): marca, color, contacto y redes. Nunca datos de pago.
export interface ImageRef {
  mediaId: string;
  /** Ruta bajo el dominio de la tienda (/m/<id>/<formato>-<revisión>.<ext>). */
  path: string;
  alt: string;
}

export interface ShareImage extends ImageRef {
  width: number;
  height: number;
  type: string;
}

export interface StoreSettings {
  brandName: string;
  tagline: string;
  color: { primary: string; dark: string; light: string; soft: string; onPrimary: string };
  logo: ImageRef | null;
  seo: { title: string; description: string; shareImage: ShareImage | null };
  contact: { whatsapp: string; address: string; pickupHours: string; mapUrl: string | null };
  social: { instagram: string | null; tiktok: string | null; facebook: string | null };
  updatedAt: string;
}

// Plazo del requisito: un cambio guardado llega a los visitantes en menos de 60 s. La API cachea 15 s
// (Cache-Control) y la tienda otros 15 s: peor caso 30 s.
export const SETTINGS_TTL_MS = 15_000;
// Si la API falla se vuelve a intentar a los 5 s, no en cada petición.
export const RETRY_AFTER_MS = 5_000;
const REQUEST_TIMEOUT_MS = 3_000;

// Respaldo si la API nunca respondió: la marca provisional y sin datos de contacto (no se muestra WhatsApp).
export const FALLBACK_SETTINGS: StoreSettings = {
  brandName: 'Clic Moda SC',
  tagline: 'Calzado de moda en Santa Cruz',
  color: {
    primary: '#c7305a',
    dark: '#9e2647',
    light: '#db6988',
    soft: '#fbeef2',
    onPrimary: '#ffffff',
  },
  logo: null,
  seo: {
    title: 'Clic Moda SC · Calzado de moda en Santa Cruz',
    description:
      'Zapatos de moda en Santa Cruz de la Sierra. Mira el catálogo, elige tu talla y cierra tu compra por WhatsApp.',
    shareImage: null,
  },
  contact: { whatsapp: '', address: '', pickupHours: '', mapUrl: null },
  social: { instagram: null, tiktok: null, facebook: null },
  updatedAt: '1970-01-01T00:00:00.000Z',
};

const isSettings = (value: unknown): value is StoreSettings => {
  const data = value as StoreSettings | null;
  return (
    typeof data?.brandName === 'string' &&
    typeof data.color?.primary === 'string' &&
    !!data.seo &&
    !!data.contact
  );
};

export async function fetchSettings(): Promise<StoreSettings> {
  const response = await fetch(`${apiBase()}/store-settings`, {
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  const data: unknown = await response.json();
  if (!response.ok || !isSettings(data))
    throw new Error('Configuración de la tienda no disponible');
  return data;
}

interface Deps {
  load: () => Promise<StoreSettings>;
  now: () => number;
}

// Caché en memoria del servidor de la tienda. Ante un fallo entrega el último valor válido (o el
// respaldo si nunca hubo uno): la tienda no se cae porque la API tarde o se reinicie.
export function createSettingsStore({ load, now }: Deps) {
  let cached: { data: StoreSettings; at: number } | null = null;
  return {
    async get(): Promise<StoreSettings> {
      const t = now();
      if (cached && t - cached.at < SETTINGS_TTL_MS) return cached.data;
      try {
        cached = { data: await load(), at: t };
      } catch {
        cached = {
          data: cached?.data ?? FALLBACK_SETTINGS,
          at: t - SETTINGS_TTL_MS + RETRY_AFTER_MS,
        };
      }
      return cached.data;
    },
    reset(): void {
      cached = null;
    },
  };
}

export const settingsStore = createSettingsStore({ load: fetchSettings, now: Date.now });
export const getSettings = (): Promise<StoreSettings> => settingsStore.get();
