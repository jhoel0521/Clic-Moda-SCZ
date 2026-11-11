import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { type MediaAssetResult, toMediaAssetResult } from '../dtos/media.dtos.js';

@Injectable()
export class ListMediaUseCase implements UseCase<void, MediaAssetResult[]> {
  constructor(@Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository) {}

  async execute(): Promise<MediaAssetResult[]> {
    const assets = await this.assets.list();
    return Promise.all(
      assets.map(async (asset) =>
        toMediaAssetResult(asset, await this.assets.listVariants(asset.id))
      )
    );
  }
}
