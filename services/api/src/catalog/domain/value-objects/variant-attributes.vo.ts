import { ValueObject } from '../../../shared/domain/value-object.js';
import {
  InvalidColorError,
  InvalidSizeError,
  InvalidSkuError,
} from '../errors/invalid-value.errors.js';

const SKU_FORMAT = /^[A-Z0-9.-]{3,40}$/;
const SIZE_FORMAT = /^[\p{L}\p{N}.,/ -]{1,20}$/u;
const COLOR_FORMAT = /^[\p{L} -]{1,30}$/u;

const tidy = (raw: string): string => raw.trim().replace(/\s+/g, ' ');

// SKU: código único de una variante. Se guarda en mayúsculas para que "zap-38" y "ZAP-38" sean el mismo.
export class Sku extends ValueObject<{ value: string }> {
  static of(raw: string): Sku {
    const value = raw.trim().toUpperCase();
    if (!SKU_FORMAT.test(value)) throw new InvalidSkuError(raw);
    return new Sku({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

// Talla como etiqueta ("38", "38.5", "M", "Única"): no es un enum para no atar el catálogo a un rubro.
export class Size extends ValueObject<{ value: string }> {
  static of(raw: string): Size {
    const value = tidy(raw);
    if (!SIZE_FORMAT.test(value)) throw new InvalidSizeError(raw);
    return new Size({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

export class Color extends ValueObject<{ value: string }> {
  static of(raw: string): Color {
    const value = tidy(raw);
    if (!COLOR_FORMAT.test(value)) throw new InvalidColorError(raw);
    return new Color({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
