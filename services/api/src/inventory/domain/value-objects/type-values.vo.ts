import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidTypeCodeError, InvalidTypeNameError } from '../errors/movement-type.errors.js';

const MAX_CODE = 30;
const CODE_FORMAT = /^[A-Z0-9_]{2,30}$/;
const MAX_ATTEMPTS = 1000;

const slugOf = (text: string): string => {
  const slug = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (slug.length === 0) return 'TIPO';
  return slug.length < 2 ? `TIPO_${slug}` : slug;
};

// Nombre legible de un tipo de movimiento (lo que ve el personal).
export class TypeName extends ValueObject<{ value: string }> {
  static of(raw: string): TypeName {
    const value = raw.trim().replace(/\s+/g, ' ');
    if (value.length < 3 || value.length > 60) throw new InvalidTypeNameError();
    return new TypeName({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

// Código estable de un tipo: lo genera el sistema a partir del nombre; la persona nunca lo escribe.
export class TypeCode extends ValueObject<{ value: string }> {
  static of(raw: string): TypeCode {
    if (!CODE_FORMAT.test(raw)) throw new InvalidTypeCodeError(raw);
    return new TypeCode({ value: raw });
  }

  // Sin acentos ni símbolos, en mayúsculas; si ya existe agrega _2, _3… sin pasar de 30 caracteres.
  static fromName(name: TypeName, taken: ReadonlySet<string>): TypeCode {
    const base = slugOf(name.value);
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      const suffix = attempt === 1 ? '' : `_${attempt}`;
      const candidate = base.slice(0, MAX_CODE - suffix.length).replace(/_+$/, '') + suffix;
      if (!taken.has(candidate)) return TypeCode.of(candidate);
    }
    throw new InvalidTypeCodeError(base);
  }

  get value(): string {
    return this.props.value;
  }
}
