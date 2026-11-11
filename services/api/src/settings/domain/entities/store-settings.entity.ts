import { BrandColor } from '../value-objects/brand-color.vo.js';
import { WhatsAppNumber, type MapUrl, type SocialUrl } from '../value-objects/contact.vo.js';
import type { MediaRef } from '../value-objects/media-ref.vo.js';
import {
  Address,
  BrandName,
  PickupHours,
  SeoDescription,
  SeoTitle,
  Tagline,
} from '../value-objects/texts.vo.js';

export interface StoreSettingsProps {
  brandName: BrandName;
  tagline: Tagline;
  brandColor: BrandColor;
  logo: MediaRef | null;
  seoTitle: SeoTitle;
  seoDescription: SeoDescription;
  shareImage: MediaRef | null;
  whatsapp: WhatsAppNumber;
  address: Address;
  pickupHours: PickupHours;
  mapUrl: MapUrl | null;
  instagram: SocialUrl | null;
  tiktok: SocialUrl | null;
  facebook: SocialUrl | null;
  updatedAt: Date;
}

export type SettingsChanges = Omit<StoreSettingsProps, 'updatedAt'>;

// La configuración de la tienda: una sola, siempre válida (cada pieza es un objeto de valor).
export class StoreSettings {
  private constructor(readonly values: StoreSettingsProps) {}

  // Valores de arranque mientras el Gerente no guarde los suyos. El WhatsApp es un marcador a reemplazar.
  static seed(now: Date = new Date()): StoreSettings {
    return new StoreSettings({
      brandName: BrandName.of('Clic Moda SC'),
      tagline: Tagline.of('Calzado de moda en Santa Cruz'),
      brandColor: BrandColor.of('#c7305a'),
      logo: null,
      seoTitle: SeoTitle.of('Clic Moda SC · Calzado de moda en Santa Cruz'),
      seoDescription: SeoDescription.of(
        'Zapatos de moda en Santa Cruz de la Sierra. Mira el catálogo, elige tu talla y cierra tu compra por WhatsApp.'
      ),
      shareImage: null,
      whatsapp: WhatsAppNumber.of('59170000000'),
      address: Address.of(''),
      pickupHours: PickupHours.of(''),
      mapUrl: null,
      instagram: null,
      tiktok: null,
      facebook: null,
      updatedAt: now,
    });
  }

  static restore(props: StoreSettingsProps): StoreSettings {
    return new StoreSettings(props);
  }

  // Reemplaza todo el contenido (el PUT no hace cambios parciales).
  replaceWith(changes: SettingsChanges, now: Date = new Date()): StoreSettings {
    return new StoreSettings({ ...changes, updatedAt: now });
  }
}
