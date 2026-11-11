import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { MediaNotFoundError } from '../../domain/errors/media.errors.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import type { MediaIdQuery } from '../dtos/media.dtos.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';
import { masterKey } from '../support/render-variants.js';

@Injectable()
export class DeleteMediaUseCase implements UseCase<MediaIdQuery, void> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort
  ) {}

  // Borra los archivos (maestra y todas las revisiones) y luego el registro.
  async execute(query: MediaIdQuery): Promise<void> {
    const id = MediaId.of(query.id);
    const asset = await this.assets.findById(id);
    if (!asset) throw new MediaNotFoundError();
    const variants = await this.assets.listVariants(id);
    await this.storage.delete([masterKey(asset), ...variants.map((v) => v.storageKey)]);
    await this.assets.delete(id);
  }
}
