import { randomUUID } from 'node:crypto';
import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidUserIdError } from '../errors/invalid-value.errors.js';

const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class UserId extends ValueObject<{ value: string }> {
  static generate(): UserId {
    return new UserId({ value: randomUUID() });
  }

  static of(raw: string): UserId {
    if (!UUID_FORMAT.test(raw)) throw new InvalidUserIdError(raw);
    return new UserId({ value: raw.toLowerCase() });
  }

  get value(): string {
    return this.props.value;
  }
}
