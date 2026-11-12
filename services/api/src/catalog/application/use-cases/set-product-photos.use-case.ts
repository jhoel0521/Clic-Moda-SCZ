import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  FieldValidationError,
  type FieldIssue,
} from '../../../shared/domain/errors/domain.error.js';
import { ProductNotFoundError } from '../../domain/errors/catalog.errors.js';
import {
  PRODUCTS_REPOSITORY,
  type ProductsRepository,
} from '../../domain/products.repository.port.js';
import { ProductId } from '../../domain/value-objects/ids.vo.js';
import { PhotoRef, ProductPhotos } from '../../domain/value-objects/product-photos.vo.js';
import {
  type ProductResult,
  type SetProductPhotosCommand,
  toProductResult,
} from '../dtos/product.dtos.js';
import {
  CATALOG_MEDIA_REFERENCES,
  type MediaReferencesPort,
} from '../ports/media-references.port.js';

// Reemplaza TODAS las fotos del producto (la primera es la principal). Cada imagen debe existir y estar
// publicada en el módulo de imágenes; si alguna falla se dice cuál y no se cambia nada.
@Injectable()
export class SetProductPhotosUseCase implements UseCase<SetProductPhotosCommand, ProductResult> {
  constructor(
    @Inject(PRODUCTS_REPOSITORY) private readonly products: ProductsRepository,
    @Inject(CATALOG_MEDIA_REFERENCES) private readonly media: MediaReferencesPort
  ) {}

  async execute(command: SetProductPhotosCommand): Promise<ProductResult> {
    const product = await this.products.findById(ProductId.of(command.productId));
    if (!product) throw new ProductNotFoundError();
    const photos = ProductPhotos.of(command.mediaIds.map((raw) => PhotoRef.of(raw)));
    await this.assertAllPublished(photos.ids);
    product.setPhotos(photos);
    await this.products.save(product);
    return toProductResult(product);
  }

  private async assertAllPublished(ids: readonly string[]): Promise<void> {
    const found = new Set((await this.media.findPublished(ids)).map((item) => item.id));
    const issues: FieldIssue[] = ids
      .map((id, index) => ({ id, index }))
      .filter(({ id }) => !found.has(id))
      .map(({ index }) => ({
        field: `photos.${String(index)}`,
        message: 'La imagen no existe o no está publicada',
      }));
    if (issues.length) throw new FieldValidationError(issues);
  }
}
