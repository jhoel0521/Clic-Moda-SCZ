import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PUBLIC_CATALOG_READER,
  type PublicCatalogReader,
} from '../../domain/public-catalog.reader.port.js';
import type { GetPublicProductQuery, PublicProductResult } from '../dtos/public-catalog.dtos.js';
import {
  CATALOG_MEDIA_REFERENCES,
  type MediaReferencesPort,
} from '../ports/media-references.port.js';
import { resolvePhotos, toDetail } from '../support/to-public.js';

// Detalle por slug: 404 si no existe o no está publicado (inactivo, categoría inactiva o sin variantes activas).
@Injectable()
export class GetPublicProductUseCase implements UseCase<
  GetPublicProductQuery,
  PublicProductResult
> {
  constructor(
    @Inject(PUBLIC_CATALOG_READER) private readonly reader: PublicCatalogReader,
    @Inject(CATALOG_MEDIA_REFERENCES) private readonly media: MediaReferencesPort
  ) {}

  async execute(query: GetPublicProductQuery): Promise<PublicProductResult> {
    const product = await this.reader.findBySlug(query.slug);
    if (!product) throw new ProductNotFoundError();
    const photos = await resolvePhotos(this.media, [product]);
    return toDetail(product, photos.get(product.slug) ?? []);
  }
}
