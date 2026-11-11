import { StoreSettings } from '../../domain/entities/store-settings.entity.js';
import { BrandColor } from '../../domain/value-objects/brand-color.vo.js';
import { MapUrl, SocialUrl, WhatsAppNumber } from '../../domain/value-objects/contact.vo.js';
import { MediaRef } from '../../domain/value-objects/media-ref.vo.js';
import {
  Address,
  BrandName,
  PickupHours,
  SeoDescription,
  SeoTitle,
  Tagline,
} from '../../domain/value-objects/texts.vo.js';
import { StoreSettingsOrmEntity } from './store-settings.orm-entities.js';

// La única fila de la tabla.
export const SETTINGS_ROW_ID = 1;

export class StoreSettingsMapper {
  static toDomain(row: StoreSettingsOrmEntity): StoreSettings {
    return StoreSettings.restore({
      brandName: BrandName.of(row.brandName),
      tagline: Tagline.of(row.tagline),
      brandColor: BrandColor.of(row.brandColor),
      logo: row.logoMediaId ? MediaRef.of('logo', row.logoMediaId) : null,
      seoTitle: SeoTitle.of(row.seoTitle),
      seoDescription: SeoDescription.of(row.seoDescription),
      shareImage: row.shareMediaId ? MediaRef.of('shareImage', row.shareMediaId) : null,
      whatsapp: WhatsAppNumber.of(row.whatsapp),
      address: Address.of(row.address),
      pickupHours: PickupHours.of(row.pickupHours),
      mapUrl: row.mapUrl ? MapUrl.of(row.mapUrl) : null,
      instagram: row.instagramUrl ? SocialUrl.of('instagram', row.instagramUrl) : null,
      tiktok: row.tiktokUrl ? SocialUrl.of('tiktok', row.tiktokUrl) : null,
      facebook: row.facebookUrl ? SocialUrl.of('facebook', row.facebookUrl) : null,
      updatedAt: row.updatedAt,
    });
  }

  static toRow(settings: StoreSettings): StoreSettingsOrmEntity {
    const v = settings.values;
    return Object.assign(new StoreSettingsOrmEntity(), {
      id: SETTINGS_ROW_ID,
      brandName: v.brandName.value,
      tagline: v.tagline.value,
      brandColor: v.brandColor.value,
      logoMediaId: v.logo?.value ?? null,
      seoTitle: v.seoTitle.value,
      seoDescription: v.seoDescription.value,
      shareMediaId: v.shareImage?.value ?? null,
      whatsapp: v.whatsapp.value,
      address: v.address.value,
      pickupHours: v.pickupHours.value,
      mapUrl: v.mapUrl?.value ?? null,
      instagramUrl: v.instagram?.value ?? null,
      tiktokUrl: v.tiktok?.value ?? null,
      facebookUrl: v.facebook?.value ?? null,
      updatedAt: v.updatedAt,
    });
  }
}
