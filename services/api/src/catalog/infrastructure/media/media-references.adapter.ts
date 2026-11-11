import { Inject, Injectable } from '@nestjs/common';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../../media/domain/media-assets.repository.port.js';
import { MediaId } from '../../../media/domain/value-objects/media-id.vo.js';
import type {
  MediaReference,
  MediaReferencesPort,
} from '../../application/ports/media-references.port.js';

// Adaptador del puerto hacia el módulo de medios: el ÚNICO punto donde `catalog` conoce a `media`.
// Una sola consulta para toda la lista (`findByIds`), así listar 48 productos no hace N+1.
@Injectable()
export class CatalogMediaReferencesAdapter implements MediaReferencesPort {
  constructor(@Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository) {}

  async findPublished(ids: readonly string[]): Promise<MediaReference[]> {
    const unique = [...new Set(ids)];
    const assets = await this.assets.findByIds(unique.map((id) => MediaId.of(id)));
    return assets
      .filter((asset) => asset.published)
      .map((asset) => ({
        id: asset.id.value,
        revision: asset.revision.value,
        alt: asset.alt.value,
      }));
  }
}
