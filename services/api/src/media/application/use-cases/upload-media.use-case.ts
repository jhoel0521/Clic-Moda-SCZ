import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { MediaAsset } from '../../domain/entities/media-asset.entity.js';
import {
  ImageTooHeavyError,
  ImageTooLargeError,
  ImageTooSmallError,
  UnsupportedImageError,
} from '../../domain/errors/media.errors.js';
import { MEDIA_LIMITS } from '../../domain/media-limits.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { AltText, FocalPoint, Framing } from '../../domain/value-objects/image-values.vo.js';
import {
  type MediaAssetResult,
  type UploadMediaCommand,
  toMediaAssetResult,
} from '../dtos/media.dtos.js';
import { IMAGE_PROCESSOR, type ImageProcessorPort } from '../ports/image-processor.port.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';
import { masterKey, renderVariants } from '../support/render-variants.js';

@Injectable()
export class UploadMediaUseCase implements UseCase<UploadMediaCommand, MediaAssetResult> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort,
    @Inject(IMAGE_PROCESSOR) private readonly processor: ImageProcessorPort
  ) {}

  async execute(command: UploadMediaCommand): Promise<MediaAssetResult> {
    const alt = AltText.of(command.alt);
    const focal = FocalPoint.of(command.focalX, command.focalY);
    const framing = Framing.of(focal, command.fit, command.background);
    await this.validate(command.file);
    const master = await this.processor.normalize(command.file, MEDIA_LIMITS.masterMaxSide);
    const asset = MediaAsset.create({
      alt,
      framing,
      dimensions: master.dimensions,
      masterMime: master.mime,
    });
    return this.store(asset, master.buffer);
  }

  // Valida por los bytes (no por la extensión), el peso, los megapíxeles y el lado corto.
  private async validate(file: Buffer): Promise<void> {
    if (file.length > MEDIA_LIMITS.maxBytes) throw new ImageTooHeavyError(12);
    const info = await this.processor.inspect(file);
    if (!info) throw new UnsupportedImageError();
    if (info.width * info.height > MEDIA_LIMITS.maxPixels) throw new ImageTooLargeError(50);
    if (Math.min(info.width, info.height) < MEDIA_LIMITS.minShortSide) {
      throw new ImageTooSmallError(MEDIA_LIMITS.minShortSide);
    }
  }

  // Guarda primero los archivos y al final la base: si algo falla se borran los archivos ya escritos.
  private async store(asset: MediaAsset, master: Buffer): Promise<MediaAssetResult> {
    const written = [masterKey(asset)];
    try {
      await this.storage.put(masterKey(asset), master, asset.masterMime);
      const variants = await renderVariants(
        { processor: this.processor, storage: this.storage },
        asset,
        master
      );
      written.push(...variants.map((variant) => variant.storageKey));
      await this.assets.save(asset);
      await this.assets.saveVariants(variants);
      return toMediaAssetResult(asset, variants);
    } catch (error) {
      await this.storage.delete(written);
      throw error;
    }
  }
}
