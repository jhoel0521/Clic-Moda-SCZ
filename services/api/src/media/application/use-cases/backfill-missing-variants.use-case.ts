import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import type { MediaAsset } from '../../domain/entities/media-asset.entity.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import { IMAGE_PROCESSOR, type ImageProcessorPort } from '../ports/image-processor.port.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';
import { masterKey, renderVariants } from '../support/render-variants.js';

// Completa las imágenes subidas antes de que existiera un formato nuevo (p. ej. `logo`): genera solo
// los formatos que faltan de su revisión vigente, desde la copia maestra. Mantiene la revisión (las URLs
// ya publicadas no cambian) y es idempotente: si no falta nada, no hace nada. Devuelve cuántas variantes creó.
@Injectable()
export class BackfillMissingVariantsUseCase implements UseCase<void, number> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort,
    @Inject(IMAGE_PROCESSOR) private readonly processor: ImageProcessorPort
  ) {}

  async execute(): Promise<number> {
    let created = 0;
    for (const asset of await this.assets.list()) created += await this.complete(asset);
    return created;
  }

  private async complete(asset: MediaAsset): Promise<number> {
    const have = (await this.assets.listVariants(asset.id))
      .filter((variant) => variant.revision.equals(asset.revision))
      .map((variant) => variant.format.name);
    const missing = MediaFormat.all().filter((format) => !have.includes(format.name));
    const master = missing.length ? await this.storage.get(masterKey(asset)) : null;
    if (!master) return 0;
    const variants = await renderVariants(
      { processor: this.processor, storage: this.storage },
      asset,
      master.body,
      missing
    );
    await this.assets.saveVariants(variants);
    return variants.length;
  }
}
