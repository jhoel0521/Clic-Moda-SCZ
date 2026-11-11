import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidMediaFormatError } from '../errors/media.errors.js';

export type MediaMime = 'image/jpeg' | 'image/webp';

interface FormatSpec {
  width: number;
  height: number;
  mime: MediaMime;
  /** Peso máximo recomendado en bytes (solo donde un canal lo exige). */
  maxBytes?: number;
}

// Una sola foto, un formato por necesidad. JPEG para todo lo que sale a otros canales (WebP no está
// garantizado en los rastreadores); WebP solo para la propia tienda.
const SPECS = {
  link: { width: 1200, height: 630, mime: 'image/jpeg', maxBytes: 300_000 },
  square: { width: 1080, height: 1080, mime: 'image/jpeg' },
  portrait: { width: 1080, height: 1350, mime: 'image/jpeg' },
  story: { width: 1080, height: 1920, mime: 'image/jpeg' },
  thumb: { width: 320, height: 320, mime: 'image/webp' },
  card: { width: 800, height: 1000, mime: 'image/webp' },
} as const satisfies Record<string, FormatSpec>;

export type MediaFormatName = keyof typeof SPECS;

export const MEDIA_FORMAT_NAMES = Object.keys(SPECS) as MediaFormatName[];

export class MediaFormat extends ValueObject<{ name: MediaFormatName }> {
  static of(raw: string): MediaFormat {
    if (!Object.hasOwn(SPECS, raw)) throw new InvalidMediaFormatError(raw);
    return new MediaFormat({ name: raw as MediaFormatName });
  }

  static all(): MediaFormat[] {
    return MEDIA_FORMAT_NAMES.map((name) => new MediaFormat({ name }));
  }

  private get spec(): FormatSpec {
    return SPECS[this.props.name];
  }

  get name(): MediaFormatName {
    return this.props.name;
  }

  get width(): number {
    return this.spec.width;
  }

  get height(): number {
    return this.spec.height;
  }

  get mime(): MediaMime {
    return this.spec.mime;
  }

  get extension(): 'jpg' | 'webp' {
    return this.spec.mime === 'image/jpeg' ? 'jpg' : 'webp';
  }

  get maxBytes(): number | undefined {
    return this.spec.maxBytes;
  }
}
