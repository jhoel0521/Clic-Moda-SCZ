import { ValueObject } from '../../../shared/domain/value-object.js';
import {
  InvalidCategoryNameError,
  InvalidProductNameError,
  InvalidSlugError,
} from '../errors/invalid-value.errors.js';

const tidy = (raw: string): string => raw.trim().replace(/\s+/g, ' ');

export class CategoryName extends ValueObject<{ value: string }> {
  static of(raw: string): CategoryName {
    const value = tidy(raw);
    if (value.length < 2 || value.length > 60) throw new InvalidCategoryNameError();
    return new CategoryName({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

export class ProductName extends ValueObject<{ value: string }> {
  static of(raw: string): ProductName {
    const value = tidy(raw);
    if (value.length < 2 || value.length > 120) throw new InvalidProductNameError();
    return new ProductName({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

const SLUG_FORMAT = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG = 80;

// Identificador de URL: sin tildes, en minúsculas y con guiones ("Zapatillas Urbanas" → "zapatillas-urbanas").
export class Slug extends ValueObject<{ value: string }> {
  static fromText(raw: string): Slug {
    const value = raw
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_SLUG)
      .replace(/-+$/g, '');
    return Slug.of(value, raw);
  }

  // Como fromText, pero un texto sin letras ni digitos (p. ej. solo símbolos) da "producto" en vez de fallar.
  static fromTextOrDefault(raw: string, fallback = 'producto'): Slug {
    try {
      return Slug.fromText(raw);
    } catch (error) {
      if (error instanceof InvalidSlugError) return Slug.of(fallback);
      throw error;
    }
  }

  static of(value: string, original: string = value): Slug {
    if (!SLUG_FORMAT.test(value)) throw new InvalidSlugError(original);
    return new Slug({ value });
  }

  // "bota-andes" → "bota-andes-2". Recorta la base ANTES de agregar el sufijo para no pasar del máximo.
  withSuffix(n: number): Slug {
    const tail = `-${String(n)}`;
    const base = this.props.value.slice(0, MAX_SLUG - tail.length).replace(/-+$/g, '');
    return Slug.of(`${base}${tail}`);
  }

  get value(): string {
    return this.props.value;
  }
}
