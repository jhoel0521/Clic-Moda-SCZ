import { Inject, Injectable } from '@nestjs/common';
import { MediaId } from '../../../media/domain/value-objects/media-id.vo.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../../media/domain/media-assets.repository.port.js';
import type {
  MediaReference,
  MediaReferencesPort,
} from '../../application/ports/media-references.port.js';

// Adaptador del puerto hacia el módulo de medios: es el ÚNICO punto donde "settings" conoce a "media".
@Injectable()
export class MediaReferencesAdapter implements MediaReferencesPort {
  constructor(@Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository) {}

  async find(id: string): Promise<MediaReference | null> {
    const asset = await this.assets.findById(MediaId.of(id));
    if (!asset?.published) return null;
    return { id: asset.id.value, revision: asset.revision.value, alt: asset.alt.value };
  }
}
