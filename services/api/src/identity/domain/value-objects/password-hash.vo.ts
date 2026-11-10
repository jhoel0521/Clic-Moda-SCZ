import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidPasswordHashError } from '../errors/invalid-value.errors.js';

const REDACTED = '[REDACTED]';

// Envuelve un hash ya calculado (nunca una contraseña en claro). No se filtra por serialización ni
// por impresión accidental: toJSON y toString devuelven un texto fijo.
export class PasswordHash extends ValueObject<{ value: string }> {
  static of(raw: string): PasswordHash {
    if (raw.length === 0) throw new InvalidPasswordHashError();
    return new PasswordHash({ value: raw });
  }

  get value(): string {
    return this.props.value;
  }

  toJSON(): string {
    return REDACTED;
  }

  toString(): string {
    return REDACTED;
  }
}
