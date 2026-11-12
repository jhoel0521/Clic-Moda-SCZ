import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  PUBLIC_CATALOG_READER,
  type PublicCatalogReader,
} from '../../domain/public-catalog.reader.port.js';
import {
  type ListPublicCatalogQuery,
  MAX_PUBLIC_PAGE_SIZE,
  type PublicCatalogPageResult,
} from '../dtos/public-catalog.dtos.js';
import {
  CATALOG_MEDIA_REFERENCES,
  type MediaReferencesPort,
} from '../ports/media-references.port.js';
import { resolvePhotos, toCard } from '../support/to-public.js';

// Listado público: solo lo vendible, con filtros, orden y paginación (hasta 48 por página).
@Injectable()
export class ListPublicCatalogUseCase implements UseCase<
  ListPublicCatalogQuery,
  PublicCatalogPageResult
> {
  constructor(
    @Inject(PUBLIC_CATALOG_READER) private readonly reader: PublicCatalogReader,
    @Inject(CATALOG_MEDIA_REFERENCES) private readonly media: MediaReferencesPort
  ) {}

  async execute(query: ListPublicCatalogQuery): Promise<PublicCatalogPageResult> {
    const pageSize = Math.min(Math.max(query.pageSize, 1), MAX_PUBLIC_PAGE_SIZE);
    const page = Math.max(query.page, 1);
    const { items, total } = await this.reader.list({
      categorySlug: query.categorySlug,
      size: query.size,
      text: query.text,
      onlyAvailable: query.onlyAvailable,
      sort: query.sort,
      page,
      pageSize,
    });
    const photos = await resolvePhotos(this.media, items);
    return {
      items: items.map((product) => toCard(product, photos.get(product.slug) ?? [])),
      total,
      page,
      pageSize,
    };
  }
}
