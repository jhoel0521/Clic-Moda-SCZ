import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidSettingError } from '../errors/settings.errors.js';

// Solo dígitos con código de país (Bolivia empieza por 591), sin ceros a la izquierda: sirve tal cual
// para wa.me/<número>.
const WHATSAPP_FORMAT = /^[1-9]\d{9,14}$/;
const MAX_URL = 300;

export class WhatsAppNumber extends ValueObject<{ value: string }> {
  static of(raw: string): WhatsAppNumber {
    const value = raw.trim();
    if (!WHATSAPP_FORMAT.test(value)) {
      throw new InvalidSettingError(
        'whatsapp',
        'El WhatsApp debe tener de 10 a 15 dígitos con código de país, por ejemplo 59171234567'
      );
    }
    return new WhatsAppNumber({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

function httpsUrl(field: string, label: string, raw: string): URL {
  const text = raw.trim();
  const url = URL.canParse(text) ? new URL(text) : null;
  if (!url || url.protocol !== 'https:' || text.length > MAX_URL) {
    throw new InvalidSettingError(
      field,
      `${label} debe ser una URL https de hasta ${String(MAX_URL)} caracteres`
    );
  }
  return url;
}

export class MapUrl extends ValueObject<{ value: string }> {
  static of(raw: string): MapUrl {
    return new MapUrl({ value: httpsUrl('mapUrl', 'El enlace del mapa', raw).toString() });
  }

  get value(): string {
    return this.props.value;
  }
}

export const SOCIAL_NETWORKS = {
  instagram: 'instagram.com',
  tiktok: 'tiktok.com',
  facebook: 'facebook.com',
} as const;

export type SocialNetwork = keyof typeof SOCIAL_NETWORKS;

const hostBelongs = (host: string, domain: string): boolean =>
  host === domain || host.endsWith(`.${domain}`);

// Enlace a una red social: https y del dominio de esa red (nada de enlaces ajenos en el pie).
export class SocialUrl extends ValueObject<{ value: string }> {
  static of(network: SocialNetwork, raw: string): SocialUrl {
    const url = httpsUrl(network, `El enlace de ${network}`, raw);
    if (!hostBelongs(url.hostname.toLowerCase(), SOCIAL_NETWORKS[network])) {
      throw new InvalidSettingError(
        network,
        `El enlace de ${network} debe ser de ${SOCIAL_NETWORKS[network]}`
      );
    }
    return new SocialUrl({ value: url.toString() });
  }

  get value(): string {
    return this.props.value;
  }
}
