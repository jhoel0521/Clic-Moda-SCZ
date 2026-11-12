import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { ProductId } from '../../domain/value-objects/ids.vo.js';
import { type GetProductQuery, type ProductResult, toProductResult } from '../dtos/product.dtos.js';
import {
  CATALOG_MEDIA_REFERENCES,
  type MediaReferencesPort,
} from '../ports/media-references.port.js';

@Injectable()
export class GetProductUseCase implements UseCase<GetProductQuery, ProductResult> {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository,
    @Inject(CATALOG_MEDIA_REFERENCES) private readonly media: MediaReferencesPort
  ) {}

  // Una foto cuya imagen se borró del módulo de imágenes se omite sin error (la siguiente pasa a ser la principal).
  async execute(query: GetProductQuery): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(query.id));
    if (!product) throw new ProductNotFoundError();
    const alive = new Set((await this.media.findPublished(product.photos.ids)).map((m) => m.id));
    return toProductResult(
      product,
      product.photos.ids.filter((id) => alive.has(id))
    );
  }
}
