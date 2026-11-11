import type { ImageDimensions, Revision } from '../value-objects/image-values.vo.js';
import type { MediaFormat } from '../value-objects/media-format.vo.js';
import type { MediaId } from '../value-objects/media-id.vo.js';

export interface MediaVariantProps {
  assetId: MediaId;
  format: MediaFormat;
  revision: Revision;
  dimensions: ImageDimensions;
  bytes: number;
  createdAt: Date;
}

// Un archivo generado para un formato y una revisión. Inmutable: nunca cambia su contenido.
export class MediaVariant {
  private constructor(private readonly props: MediaVariantProps) {}

  static create(props: MediaVariantProps): MediaVariant {
    return new MediaVariant({ ...props });
  }

  /** Clave del objeto en el almacenamiento: m/<id>/<formato>-<revisión>.<ext> */
  get storageKey(): string {
    const { assetId, format, revision } = this.props;
    return `m/${assetId.value}/${format.name}-${revision.value}.${format.extension}`;
  }

  get assetId(): MediaId {
    return this.props.assetId;
  }

  get format(): MediaFormat {
    return this.props.format;
  }

  get revision(): Revision {
    return this.props.revision;
  }

  get dimensions(): ImageDimensions {
    return this.props.dimensions;
  }

  get bytes(): number {
    return this.props.bytes;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
