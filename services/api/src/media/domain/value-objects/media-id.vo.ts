import { UuidValueObject } from '../../../shared/domain/uuid-value-object.js';
import { InvalidMediaIdError } from '../errors/media.errors.js';

export class MediaId extends UuidValueObject {
  static generate(): MediaId {
    return new MediaId({ value: UuidValueObject.fresh() });
  }

  static of(raw: string): MediaId {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidMediaIdError(raw);
    return new MediaId({ value });
  }
}
