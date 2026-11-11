import { UuidValueObject } from '../../../shared/domain/uuid-value-object.js';
import { InvalidSettingError } from '../errors/settings.errors.js';

// Referencia a una imagen del módulo de medios (solo su identificador; el contexto no conoce más).
export class MediaRef extends UuidValueObject {
  static of(field: string, raw: string): MediaRef {
    const value = UuidValueObject.parse(raw);
    if (!value) throw new InvalidSettingError(field, 'La imagen elegida no es válida');
    return new MediaRef({ value });
  }
}
