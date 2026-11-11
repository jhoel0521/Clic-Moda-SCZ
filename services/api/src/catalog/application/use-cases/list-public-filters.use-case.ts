import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  PUBLIC_CATALOG_READER,
  type PublicCatalogReader,
} from '../../domain/public-catalog.reader.port.js';
import type { PublicFiltersResult } from '../dtos/public-catalog.dtos.js';

// Categorías con productos publicados (con su conteo) y tallas existentes, para armar los filtros.
@Injectable()
export class ListPublicFiltersUseCase implements UseCase<void, PublicFiltersResult> {
  constructor(@Inject(PUBLIC_CATALOG_READER) private readonly reader: PublicCatalogReader) {}

  execute(): Promise<PublicFiltersResult> {
    return this.reader.filters();
  }
}
