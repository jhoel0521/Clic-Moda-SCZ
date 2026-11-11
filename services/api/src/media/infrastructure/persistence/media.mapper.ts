import { MediaAsset, type MasterMime } from '../../domain/entities/media-asset.entity.js';
import { MediaVariant } from '../../domain/entities/media-variant.entity.js';
import {
  AltText,
  FocalPoint,
  Framing,
  ImageDimensions,
  type FitMode,
  Revision,
} from '../../domain/value-objects/image-values.vo.js';
import { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import { MediaAssetOrmEntity, MediaVariantOrmEntity } from './media.orm-entities.js';

export const MediaAssetMapper = {
  toDomain(row: MediaAssetOrmEntity): MediaAsset {
    return MediaAsset.restore({
      id: MediaId.of(row.id),
      alt: AltText.of(row.alt),
      framing: Framing.of(
        FocalPoint.of(row.focalX, row.focalY),
        row.fit as FitMode,
        row.background
      ),
      dimensions: ImageDimensions.of(row.width, row.height),
      masterMime: row.masterMime as MasterMime,
      revision: Revision.of(row.revision),
      published: row.published,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  },

  toRow(asset: MediaAsset): MediaAssetOrmEntity {
    return Object.assign(new MediaAssetOrmEntity(), {
      id: asset.id.value,
      alt: asset.alt.value,
      focalX: asset.framing.focal.x,
      focalY: asset.framing.focal.y,
      fit: asset.framing.fit,
      background: asset.framing.background,
      width: asset.dimensions.width,
      height: asset.dimensions.height,
      masterMime: asset.masterMime,
      revision: asset.revision.value,
      published: asset.published,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
    });
  },
};

export const MediaVariantMapper = {
  toDomain(row: MediaVariantOrmEntity): MediaVariant {
    return MediaVariant.create({
      assetId: MediaId.of(row.assetId),
      format: MediaFormat.of(row.format),
      revision: Revision.of(row.revision),
      dimensions: ImageDimensions.of(row.width, row.height),
      bytes: row.bytes,
      createdAt: row.createdAt,
    });
  },

  toRow(variant: MediaVariant): MediaVariantOrmEntity {
    return Object.assign(new MediaVariantOrmEntity(), {
      assetId: variant.assetId.value,
      format: variant.format.name,
      revision: variant.revision.value,
      width: variant.dimensions.width,
      height: variant.dimensions.height,
      bytes: variant.bytes,
      createdAt: variant.createdAt,
    });
  },
};
