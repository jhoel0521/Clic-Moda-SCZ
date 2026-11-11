import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { MediaNotFoundError } from '../../domain/errors/media.errors.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import type { MasterResult, MediaIdQuery } from '../dtos/media.dtos.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';
import { masterKey } from '../support/render-variants.js';

// Solo para el admin autenticado: la copia maestra nunca se sirve por la ruta pública.
@Injectable()
export class GetMediaMasterUseCase implements UseCase<MediaIdQuery, MasterResult> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort
  ) {}

  async execute(query: MediaIdQuery): Promise<MasterResult> {
    const asset = await this.assets.findById(MediaId.of(query.id));
    if (!asset) throw new MediaNotFoundError();
    const stored = await this.storage.get(masterKey(asset));
    if (!stored) throw new MediaNotFoundError();
    return { body: stored.body, contentType: stored.contentType };
  }
}
