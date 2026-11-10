import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidEmailError } from '../errors/invalid-value.errors.js';

const EMAIL_FORMAT = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LENGTH = 254;

export class Email extends ValueObject<{ value: string }> {
  static of(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (value.length > MAX_LENGTH || !EMAIL_FORMAT.test(value)) throw new InvalidEmailError(raw);
    return new Email({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
