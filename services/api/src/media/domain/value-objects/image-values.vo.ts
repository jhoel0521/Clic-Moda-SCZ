import { ValueObject } from '../../../shared/domain/value-object.js';
import {
  InvalidAltTextError,
  InvalidFocalPointError,
  InvalidFramingError,
  InvalidImageDimensionsError,
  InvalidRevisionError,
} from '../errors/media.errors.js';

const MAX_ALT = 125;
const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const inUnit = (n: number): boolean => Number.isFinite(n) && n >= 0 && n <= 1;

export class AltText extends ValueObject<{ value: string }> {
  static of(raw: string): AltText {
    const value = raw.trim().replace(/\s+/g, ' ');
    if (value.length < 1 || value.length > MAX_ALT) throw new InvalidAltTextError();
    return new AltText({ value });
  }

  get value(): string {
    return this.props.value;
  }
}

export class FocalPoint extends ValueObject<{ x: number; y: number }> {
  static of(x: number, y: number): FocalPoint {
    if (!inUnit(x) || !inUnit(y)) throw new InvalidFocalPointError();
    return new FocalPoint({ x, y });
  }

  static center(): FocalPoint {
    return new FocalPoint({ x: 0.5, y: 0.5 });
  }

  get x(): number {
    return this.props.x;
  }

  get y(): number {
    return this.props.y;
  }
}

export type FitMode = 'cover' | 'contain';

// Cómo se encuadra la foto: punto de enfoque, recorte (cover) o completa sobre un fondo (contain).
export class Framing extends ValueObject<{ focal: FocalPoint; fit: FitMode; background: string }> {
  static of(focal: FocalPoint, fit: FitMode = 'cover', background = '#ffffff'): Framing {
    if (fit !== 'cover' && fit !== 'contain')
      throw new InvalidFramingError(`modo "${String(fit)}"`);
    if (!HEX_COLOR.test(background)) throw new InvalidFramingError('el fondo debe ser #rrggbb');
    return new Framing({ focal, fit, background: background.toLowerCase() });
  }

  static default(): Framing {
    return Framing.of(FocalPoint.center());
  }

  get focal(): FocalPoint {
    return this.props.focal;
  }

  get fit(): FitMode {
    return this.props.fit;
  }

  get background(): string {
    return this.props.background;
  }
}

export class ImageDimensions extends ValueObject<{ width: number; height: number }> {
  static of(width: number, height: number): ImageDimensions {
    if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1) {
      throw new InvalidImageDimensionsError(`${String(width)}x${String(height)}`);
    }
    return new ImageDimensions({ width, height });
  }

  get width(): number {
    return this.props.width;
  }

  get height(): number {
    return this.props.height;
  }

  get shortSide(): number {
    return Math.min(this.props.width, this.props.height);
  }

  get pixels(): number {
    return this.props.width * this.props.height;
  }
}

export class Revision extends ValueObject<{ value: number }> {
  static first(): Revision {
    return new Revision({ value: 1 });
  }

  static of(value: number): Revision {
    if (!Number.isInteger(value) || value < 1) throw new InvalidRevisionError();
    return new Revision({ value });
  }

  next(): Revision {
    return new Revision({ value: this.props.value + 1 });
  }

  get value(): number {
    return this.props.value;
  }
}
