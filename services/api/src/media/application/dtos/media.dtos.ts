import type { MediaAsset } from '../../domain/entities/media-asset.entity.js';
import type { MediaVariant } from '../../domain/entities/media-variant.entity.js';
import type { FitMode } from '../../domain/value-objects/image-values.vo.js';

export class UploadMediaCommand {
  constructor(
    readonly file: Buffer,
    readonly alt: string,
    readonly fit: FitMode = 'cover',
    readonly background: string = '#ffffff',
    readonly focalX: number = 0.5,
    readonly focalY: number = 0.5
  ) {}
}

export class ChangeFocalPointCommand {
  constructor(
    readonly id: string,
    readonly focalX: number,
    readonly focalY: number,
    readonly fit?: FitMode,
    readonly background?: string
  ) {}
}

export class MediaIdQuery {
  constructor(readonly id: string) {}
}

export class PublicVariantQuery {
  constructor(
    readonly id: string,
    readonly format: string,
    readonly revision: number,
    readonly extension: string
  ) {}
}

export class PurgeObsoleteMediaCommand {
  constructor(readonly olderThan: Date) {}
}

export interface MediaVariantResult {
  readonly format: string;
  readonly revision: number;
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  /** Ruta pública relativa al dominio de la tienda. */
  readonly url: string;
}

export interface MediaAssetResult {
  readonly id: string;
  readonly alt: string;
  readonly focal: { readonly x: number; readonly y: number };
  readonly fit: FitMode;
  readonly background: string;
  readonly width: number;
  readonly height: number;
  readonly revision: number;
  readonly published: boolean;
  readonly createdAt: Date;
  readonly variants: MediaVariantResult[];
}

export interface PublicVariantResult {
  readonly body: Buffer;
  readonly contentType: string;
  /** Estable: una revisión publicada nunca cambia. */
  readonly etag: string;
}

export interface MasterResult {
  readonly body: Buffer;
  readonly contentType: string;
}

export const publicPath = (variant: MediaVariant): string =>
  `/m/${variant.assetId.value}/${variant.format.name}-${String(variant.revision.value)}.${variant.format.extension}`;

const toVariantResult = (variant: MediaVariant): MediaVariantResult => ({
  format: variant.format.name,
  revision: variant.revision.value,
  width: variant.dimensions.width,
  height: variant.dimensions.height,
  bytes: variant.bytes,
  url: publicPath(variant),
});

// Solo se muestran las variantes de la revisión vigente.
export const toMediaAssetResult = (
  asset: MediaAsset,
  variants: MediaVariant[]
): MediaAssetResult => ({
  id: asset.id.value,
  alt: asset.alt.value,
  focal: { x: asset.framing.focal.x, y: asset.framing.focal.y },
  fit: asset.framing.fit,
  background: asset.framing.background,
  width: asset.dimensions.width,
  height: asset.dimensions.height,
  revision: asset.revision.value,
  published: asset.published,
  createdAt: asset.createdAt,
  variants: variants.filter((v) => v.revision.equals(asset.revision)).map(toVariantResult),
});
