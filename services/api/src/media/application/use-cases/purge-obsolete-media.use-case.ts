import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import type { PurgeObsoleteMediaCommand } from '../dtos/media.dtos.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';

// Borra las variantes de revisiones que ya no son la vigente y son más viejas que `olderThan`.
@Injectable()
export class PurgeObsoleteMediaUseCase implements UseCase<PurgeObsoleteMediaCommand, number> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort
  ) {}

  async execute(command: PurgeObsoleteMediaCommand): Promise<number> {
    const obsolete = await this.assets.findObsoleteVariants(command.olderThan);
    if (obsolete.length === 0) return 0;
    await this.storage.delete(obsolete.map((variant) => variant.storageKey));
    await this.assets.deleteVariants(obsolete);
    return obsolete.length;
  }
}
