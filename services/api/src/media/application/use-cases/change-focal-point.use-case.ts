import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { MediaNotFoundError } from '../../domain/errors/media.errors.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { FocalPoint, Framing } from '../../domain/value-objects/image-values.vo.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import {
  type ChangeFocalPointCommand,
  type MediaAssetResult,
  toMediaAssetResult,
} from '../dtos/media.dtos.js';
import { IMAGE_PROCESSOR, type ImageProcessorPort } from '../ports/image-processor.port.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';
import { masterKey, renderVariants } from '../support/render-variants.js';

@Injectable()
export class ChangeFocalPointUseCase implements UseCase<ChangeFocalPointCommand, MediaAssetResult> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort,
    @Inject(IMAGE_PROCESSOR) private readonly processor: ImageProcessorPort
  ) {}

  // Crea una revisión nueva con las variantes recalculadas; las revisiones anteriores no se tocan.
  async execute(command: ChangeFocalPointCommand): Promise<MediaAssetResult> {
    const asset = await this.assets.findById(MediaId.of(command.id));
    if (!asset) throw new MediaNotFoundError();
    const master = await this.storage.get(masterKey(asset));
    if (!master) throw new MediaNotFoundError();
    asset.reframe(this.framingFor(command, asset.framing));
    const variants = await renderVariants(
      { processor: this.processor, storage: this.storage },
      asset,
      master.body
    );
    await this.assets.save(asset);
    await this.assets.saveVariants(variants);
    return toMediaAssetResult(asset, variants);
  }

  private framingFor(command: ChangeFocalPointCommand, current: Framing): Framing {
    return Framing.of(
      FocalPoint.of(command.focalX, command.focalY),
      command.fit ?? current.fit,
      command.background ?? current.background
    );
  }
}
