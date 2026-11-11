import { UuidValueObject } from '../../../shared/domain/uuid-value-object.js';
import { ValueObject } from '../../../shared/domain/value-object.js';
import {
  DuplicatePhotoError,
  InvalidPhotoError,
  TooManyPhotosError,
} from '../errors/catalog.errors.js';

export const MAX_PHOTOS = 8;

// Referencia a una imagen del módulo de medios: solo su identificador (el catálogo no conoce más).
export class PhotoRef extends UuidValueObject {
  static of(raw: string): PhotoRef {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidPhotoError(raw);
    return new PhotoRef({ value });
  }
}

// Fotos de un producto: de 0 a 8, sin repetidos y en orden; la primera es la principal.
export class ProductPhotos extends ValueObject<{ refs: readonly PhotoRef[] }> {
  static empty(): ProductPhotos {
    return new ProductPhotos({ refs: [] });
  }

  static of(refs: readonly PhotoRef[]): ProductPhotos {
    if (refs.length > MAX_PHOTOS) throw new TooManyPhotosError(MAX_PHOTOS);
    if (new Set(refs.map((ref) => ref.value)).size !== refs.length) throw new DuplicatePhotoError();
    return new ProductPhotos({ refs: [...refs] });
  }

  get refs(): readonly PhotoRef[] {
    return this.props.refs;
  }

  get ids(): string[] {
    return this.props.refs.map((ref) => ref.value);
  }

  get main(): PhotoRef | null {
    return this.props.refs[0] ?? null;
  }
}
