import type {
  StoreSettings,
  StoreSettingsProps,
} from '../../domain/entities/store-settings.entity.js';
import type { ImageResult, SettingsResult, ShareImageResult } from '../dtos/settings.dtos.js';
import type { MediaReference, MediaReferencesPort } from '../ports/media-references.port.js';

// Medidas del formato `link` del módulo de medios (1200x630 JPEG): son las que declara og:image:*.
const LINK = { width: 1200, height: 630, type: 'image/jpeg' } as const;

const imagePath = (ref: MediaReference, format: string, ext: string): string =>
  `/m/${ref.id}/${format}-${String(ref.revision)}.${ext}`;

async function resolve(
  media: MediaReferencesPort,
  id: string | undefined
): Promise<MediaReference | null> {
  return id ? media.find(id) : null;
}

const logoOf = (ref: MediaReference | null): ImageResult | null =>
  ref ? { mediaId: ref.id, path: imagePath(ref, 'logo', 'webp'), alt: ref.alt } : null;

const shareOf = (ref: MediaReference | null): ShareImageResult | null =>
  ref ? { mediaId: ref.id, path: imagePath(ref, 'link', 'jpg'), alt: ref.alt, ...LINK } : null;

const contactOf = (v: StoreSettingsProps): SettingsResult['contact'] => ({
  whatsapp: v.whatsapp.value,
  address: v.address.value,
  pickupHours: v.pickupHours.value,
  mapUrl: v.mapUrl?.value ?? null,
});

const socialOf = (v: StoreSettingsProps): SettingsResult['social'] => ({
  instagram: v.instagram?.value ?? null,
  tiktok: v.tiktok?.value ?? null,
  facebook: v.facebook?.value ?? null,
});

// Arma la respuesta pública. Una imagen borrada del módulo de medios se omite: la tienda cae al texto.
export async function toSettingsResult(
  settings: StoreSettings,
  media: MediaReferencesPort
): Promise<SettingsResult> {
  const v = settings.values;
  const [logo, share] = await Promise.all([
    resolve(media, v.logo?.value),
    resolve(media, v.shareImage?.value),
  ]);
  const seo = {
    title: v.seoTitle.value,
    description: v.seoDescription.value,
    shareImage: shareOf(share),
  };
  return {
    brandName: v.brandName.value,
    tagline: v.tagline.value,
    color: v.brandColor.palette,
    logo: logoOf(logo),
    seo,
    contact: contactOf(v),
    social: socialOf(v),
    updatedAt: v.updatedAt.toISOString(),
  };
}
