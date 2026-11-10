import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidPersonNameError } from '../errors/invalid-value.errors.js';

const MAX_LENGTH = 100;

export class PersonName extends ValueObject<{ value: string }> {
  static of(raw: string): PersonName {
    const value = raw.trim().replace(/\s+/g, ' ');
    if (value.length === 0 || value.length > MAX_LENGTH) throw new InvalidPersonNameError();
    return new PersonName({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
