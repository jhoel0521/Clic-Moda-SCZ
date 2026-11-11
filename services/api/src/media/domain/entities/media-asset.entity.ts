import type { AltText, Framing, ImageDimensions } from '../value-objects/image-values.vo.js';
import { Revision } from '../value-objects/image-values.vo.js';
import { MediaId } from '../value-objects/media-id.vo.js';

export type MasterMime = 'image/jpeg' | 'image/png';

export interface MediaAssetProps {
  id: MediaId;
  alt: AltText;
  framing: Framing;
  /** Medidas de la copia maestra normalizada. */
  dimensions: ImageDimensions;
  masterMime: MasterMime;
  revision: Revision;
  /** Solo las imágenes publicadas se sirven por la ruta pública. */
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type NewMediaAsset = Pick<MediaAssetProps, 'alt' | 'framing' | 'dimensions' | 'masterMime'>;

export class MediaAsset {
  private constructor(private props: MediaAssetProps) {}

  static create(input: NewMediaAsset, now: Date = new Date()): MediaAsset {
    return new MediaAsset({
      ...input,
      id: MediaId.generate(),
      revision: Revision.first(),
      published: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: MediaAssetProps): MediaAsset {
    return new MediaAsset({ ...props });
  }

  // Cambiar el encuadre crea una revisión nueva: las anteriores no se modifican, así los enlaces
  // ya compartidos siguen mostrando lo que mostraban.
  reframe(framing: Framing, now: Date = new Date()): void {
    this.props = { ...this.props, framing, revision: this.props.revision.next(), updatedAt: now };
  }

  describe(alt: AltText, now: Date = new Date()): void {
    this.props = { ...this.props, alt, updatedAt: now };
  }

  publish(now: Date = new Date()): void {
    this.props = { ...this.props, published: true, updatedAt: now };
  }

  unpublish(now: Date = new Date()): void {
    this.props = { ...this.props, published: false, updatedAt: now };
  }

  get id(): MediaId {
    return this.props.id;
  }

  get alt(): AltText {
    return this.props.alt;
  }

  get framing(): Framing {
    return this.props.framing;
  }

  get dimensions(): ImageDimensions {
    return this.props.dimensions;
  }

  get masterMime(): MasterMime {
    return this.props.masterMime;
  }

  get revision(): Revision {
    return this.props.revision;
  }

  get published(): boolean {
    return this.props.published;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
