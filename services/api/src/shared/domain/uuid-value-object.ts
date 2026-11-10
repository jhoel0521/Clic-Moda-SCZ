import { randomUUID } from 'node:crypto';
import { ValueObject } from './value-object.js';

const UUID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Base de los identificadores UUID de cada agregado. Las subclases exponen `of` y `generate` y
// lanzan su propio error de dominio cuando el texto no es un UUID.
export abstract class UuidValueObject extends ValueObject<{ value: string }> {
  protected static parse(raw: string): string | null {
    return UUID_FORMAT.test(raw) ? raw.toLowerCase() : null;
  }

  protected static fresh(): string {
    return randomUUID();
  }

  get value(): string {
    return this.props.value;
  }
}
