import { ValueObject } from '../../../shared/domain/value-object.js';
import {
  InvalidIdempotencyKeyError,
  InvalidLocationError,
  InvalidOperatorError,
  InvalidQuantityError,
  InvalidReasonError,
  InvalidReorderLevelError,
} from '../errors/inventory.errors.js';

const MAX_UNITS = 1_000_000;
const tidy = (raw: string): string => raw.trim().replace(/\s+/g, ' ');

// Unidades enteras. `positive` para ingresos y salidas; `count` para el conteo de un ajuste (puede ser 0).
export class Quantity extends ValueObject<{ units: number }> {
  static positive(units: number): Quantity {
    return Quantity.within(units, 1);
  }

  static count(units: number): Quantity {
    return Quantity.within(units, 0);
  }

  private static within(units: number, min: number): Quantity {
    if (!Number.isInteger(units)) throw new InvalidQuantityError('debe ser un número entero');
    if (units < min) throw new InvalidQuantityError(`debe ser al menos ${min}`);
    if (units > MAX_UNITS) throw new InvalidQuantityError(`no puede superar ${MAX_UNITS}`);
    return new Quantity({ units });
  }

  get units(): number {
    return this.props.units;
  }
}

export class Reason extends ValueObject<{ value: string }> {
  static of(raw: string): Reason {
    const value = tidy(raw);
    if (value.length < 3 || value.length > 200) throw new InvalidReasonError();
    return new Reason({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

const KEY_FORMAT = /^[A-Za-z0-9._:-]{8,64}$/;

export class IdempotencyKey extends ValueObject<{ value: string }> {
  static of(raw: string): IdempotencyKey {
    const value = raw.trim();
    if (!KEY_FORMAT.test(value)) throw new InvalidIdempotencyKeyError();
    return new IdempotencyKey({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

// Quién hizo el movimiento (el id del usuario del personal).
export class Operator extends ValueObject<{ value: string }> {
  static of(raw: string): Operator {
    const value = raw.trim();
    if (value.length < 1 || value.length > 100) throw new InvalidOperatorError();
    return new Operator({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

export class Location extends ValueObject<{ value: string }> {
  static of(raw: string): Location {
    const value = tidy(raw);
    if (value.length < 1 || value.length > 40) throw new InvalidLocationError();
    return new Location({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

export class ReorderLevel extends ValueObject<{ units: number }> {
  static of(units: number): ReorderLevel {
    if (!Number.isInteger(units) || units < 0 || units > MAX_UNITS)
      throw new InvalidReorderLevelError();
    return new ReorderLevel({ units });
  }

  get units(): number {
    return this.props.units;
  }
}
