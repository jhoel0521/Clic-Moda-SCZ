import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  PUBLIC_CATALOG_READER,
  type PublicCatalogReader,
} from '../../domain/public-catalog.reader.port.js';
import type { PublishedSlugResult } from '../dtos/public-catalog.dtos.js';

// Lectura liviana para el sitemap: todos los slugs publicados y su fecha, sin el tope del listado.
@Injectable()
export class ListPublishedSlugsUseCase implements UseCase<void, PublishedSlugResult[]> {
  constructor(@Inject(PUBLIC_CATALOG_READER) private readonly reader: PublicCatalogReader) {}

  async execute(): Promise<PublishedSlugResult[]> {
    const slugs = await this.reader.slugs();
    return slugs.map((item) => ({ slug: item.slug, updatedAt: item.updatedAt.toISOString() }));
  }
}
