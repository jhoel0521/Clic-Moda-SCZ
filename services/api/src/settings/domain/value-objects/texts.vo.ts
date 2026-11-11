import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidSettingError } from '../errors/settings.errors.js';

const HTML_CHARS = /[<>]/;

// Texto de la tienda: sin espacios sobrantes, dentro del rango y sin etiquetas HTML (la tienda además
// lo escapa al pintar).
function boundedText(field: string, label: string, raw: string, min: number, max: number): string {
  const value = raw.trim().replace(/\s+/g, ' ');
  if (value.length < min || value.length > max) {
    const range =
      min === 0 ? `como máximo ${String(max)}` : `entre ${String(min)} y ${String(max)}`;
    throw new InvalidSettingError(field, `${label} debe tener ${range} caracteres`);
  }
  if (HTML_CHARS.test(value)) throw new InvalidSettingError(field, `${label} no admite < ni >`);
  return value;
}

abstract class Text extends ValueObject<{ value: string }> {
  get value(): string {
    return this.props.value;
  }
}

export class BrandName extends Text {
  static of(raw: string): BrandName {
    return new BrandName({ value: boundedText('brandName', 'El nombre', raw, 2, 24) });
  }
}

export class Tagline extends Text {
  static of(raw: string): Tagline {
    return new Tagline({ value: boundedText('tagline', 'El eslogan', raw, 0, 60) });
  }
}

export class SeoTitle extends Text {
  static of(raw: string): SeoTitle {
    return new SeoTitle({ value: boundedText('seoTitle', 'El título de búsqueda', raw, 10, 60) });
  }
}

export class SeoDescription extends Text {
  static of(raw: string): SeoDescription {
    const value = boundedText('seoDescription', 'La descripción de búsqueda', raw, 70, 160);
    return new SeoDescription({ value });
  }
}

export class Address extends Text {
  static of(raw: string): Address {
    return new Address({ value: boundedText('address', 'La dirección', raw, 0, 160) });
  }
}

export class PickupHours extends Text {
  static of(raw: string): PickupHours {
    return new PickupHours({ value: boundedText('pickupHours', 'El horario', raw, 0, 120) });
  }
}
