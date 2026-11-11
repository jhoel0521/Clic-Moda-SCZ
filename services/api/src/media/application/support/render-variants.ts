import { computeCrop } from '../../domain/crop.js';
import type { MediaAsset } from '../../domain/entities/media-asset.entity.js';
import { MediaVariant } from '../../domain/entities/media-variant.entity.js';
import { ImageDimensions } from '../../domain/value-objects/image-values.vo.js';
import { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import type { ImageProcessorPort } from '../ports/image-processor.port.js';
import type { MediaStoragePort } from '../ports/media-storage.port.js';

export const masterKey = (asset: MediaAsset): string =>
  `m/${asset.id.value}/master.${asset.masterMime === 'image/png' ? 'png' : 'jpg'}`;

async function renderOne(
  deps: { processor: ImageProcessorPort; storage: MediaStoragePort },
  asset: MediaAsset,
  master: Buffer,
  format: MediaFormat
): Promise<MediaVariant> {
  const plan = computeCrop(asset.dimensions, format, asset.framing);
  const buffer = await deps.processor.render(master, format, plan);
  const variant = MediaVariant.create({
    assetId: asset.id,
    format,
    revision: asset.revision,
    dimensions: ImageDimensions.of(format.width, format.height),
    bytes: buffer.length,
    createdAt: new Date(),
  });
  await deps.storage.put(variant.storageKey, buffer, format.mime);
  return variant;
}

// Genera y guarda todos los formatos de la revisión vigente de la imagen.
export async function renderVariants(
  deps: { processor: ImageProcessorPort; storage: MediaStoragePort },
  asset: MediaAsset,
  master: Buffer
): Promise<MediaVariant[]> {
  return Promise.all(MediaFormat.all().map((format) => renderOne(deps, asset, master, format)));
}
