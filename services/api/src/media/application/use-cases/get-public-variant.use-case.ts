import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { MediaNotFoundError } from '../../domain/errors/media.errors.js';
import {
  MEDIA_ASSETS_REPOSITORY,
  type MediaAssetsRepository,
} from '../../domain/media-assets.repository.port.js';
import { Revision } from '../../domain/value-objects/image-values.vo.js';
import { MediaFormat } from '../../domain/value-objects/media-format.vo.js';
import { MediaId } from '../../domain/value-objects/media-id.vo.js';
import type { PublicVariantQuery, PublicVariantResult } from '../dtos/media.dtos.js';
import { MEDIA_STORAGE, type MediaStoragePort } from '../ports/media-storage.port.js';

interface VariantRef {
  id: MediaId;
  format: MediaFormat;
  revision: Revision;
}

// Cualquier dato inválido o no publicado responde "no existe": la ruta pública no distingue casos.
@Injectable()
export class GetPublicVariantUseCase implements UseCase<PublicVariantQuery, PublicVariantResult> {
  constructor(
    @Inject(MEDIA_ASSETS_REPOSITORY) private readonly assets: MediaAssetsRepository,
    @Inject(MEDIA_STORAGE) private readonly storage: MediaStoragePort
  ) {}

  async execute(query: PublicVariantQuery): Promise<PublicVariantResult> {
    const ref = this.parse(query);
    const asset = await this.assets.findById(ref.id);
    if (!asset?.published) throw new MediaNotFoundError();
    const variant = await this.assets.findVariant(ref.id, ref.format, ref.revision);
    const stored = variant ? await this.storage.get(variant.storageKey) : null;
    if (!variant || !stored) throw new MediaNotFoundError();
    const etag = `"${ref.id.value}-${ref.format.name}-${String(ref.revision.value)}"`;
    return { body: stored.body, contentType: variant.format.mime, etag };
  }

  private parse(query: PublicVariantQuery): VariantRef {
    try {
      const format = MediaFormat.of(query.format);
      if (format.extension !== query.extension) throw new MediaNotFoundError();
      return { id: MediaId.of(query.id), format, revision: Revision.of(query.revision) };
    } catch {
      throw new MediaNotFoundError();
    }
  }
}
