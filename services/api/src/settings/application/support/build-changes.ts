import { DomainError, type FieldIssue } from '../../../shared/domain/errors/domain.error.js';
import type { SettingsChanges } from '../../domain/entities/store-settings.entity.js';
import { InvalidSettingError } from '../../domain/errors/settings.errors.js';
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
import type { UpdateSettingsCommand as Command } from '../dtos/settings.dtos.js';

// Junta TODOS los campos inválidos de una vez (el formulario marca cada uno) en vez de parar en el primero.
export class IssueCollector {
  readonly issues: FieldIssue[] = [];

  // Valida un campo obligatorio: devuelve el valor o null (y anota el motivo).
  take<T>(field: string, make: () => T): T | null {
    try {
      return make();
    } catch (error) {
      if (!(error instanceof DomainError)) throw error;
      const named = error instanceof InvalidSettingError ? error.field : field;
      this.issues.push({ field: named, message: error.message });
      return null;
    }
  }

  // Campo opcional: vacío o ausente es válido y queda en null.
  optional<T>(field: string, raw: string | null, make: (value: string) => T): T | null {
    return raw?.trim() ? this.take(field, () => make(raw)) : null;
  }
}

const SOCIAL = (network: 'instagram' | 'tiktok' | 'facebook') => (raw: string) =>
  SocialUrl.of(network, raw);

function textsOf(c: Command, collect: IssueCollector) {
  return {
    brandName: collect.take('brandName', () => BrandName.of(c.brandName)),
    tagline: collect.take('tagline', () => Tagline.of(c.tagline)),
    seoTitle: collect.take('seoTitle', () => SeoTitle.of(c.seoTitle)),
    seoDescription: collect.take('seoDescription', () => SeoDescription.of(c.seoDescription)),
    address: collect.take('address', () => Address.of(c.address)),
    pickupHours: collect.take('pickupHours', () => PickupHours.of(c.pickupHours)),
  };
}

function contactOf(c: Command, collect: IssueCollector) {
  return {
    brandColor: collect.take('brandColor', () => BrandColor.of(c.brandColor)),
    whatsapp: collect.take('whatsapp', () => WhatsAppNumber.of(c.whatsapp)),
    mapUrl: collect.optional('mapUrl', c.mapUrl, (raw) => MapUrl.of(raw)),
    instagram: collect.optional('instagram', c.instagram, SOCIAL('instagram')),
    tiktok: collect.optional('tiktok', c.tiktok, SOCIAL('tiktok')),
    facebook: collect.optional('facebook', c.facebook, SOCIAL('facebook')),
  };
}

function imagesOf(c: Command, collect: IssueCollector) {
  return {
    logo: collect.optional('logo', c.logoMediaId, (raw) => MediaRef.of('logo', raw)),
    shareImage: collect.optional('shareImage', c.shareMediaId, (raw) =>
      MediaRef.of('shareImage', raw)
    ),
  };
}

// Valida todo el comando. Si algún campo falla devuelve null y `collect.issues` dice cuáles.
export function buildChanges(c: Command, collect: IssueCollector): SettingsChanges | null {
  const parts = { ...textsOf(c, collect), ...contactOf(c, collect), ...imagesOf(c, collect) };
  // Sin errores acumulados ningún campo obligatorio quedó en null.
  return collect.issues.length ? null : (parts as SettingsChanges);
}
