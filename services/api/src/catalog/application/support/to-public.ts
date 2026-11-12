import { aggregateAvailability, availabilityOf } from '../../domain/availability.js';
import type { PublishedProduct } from '../../domain/public-catalog.reader.port.js';
import type {
  PublicPhotoResult,
  PublicProductCardResult,
  PublicProductResult,
} from '../dtos/public-catalog.dtos.js';
import type { MediaReference, MediaReferencesPort } from '../ports/media-references.port.js';

const photoOf = (ref: MediaReference): PublicPhotoResult => {
  const rev = String(ref.revision);
  return {
    alt: ref.alt,
    card: `/m/${ref.id}/card-${rev}.webp`,
    thumb: `/m/${ref.id}/thumb-${rev}.webp`,
    link: `/m/${ref.id}/link-${rev}.jpg`,
  };
};

// Fotos de varios productos con UNA sola consulta al módulo de imágenes (sin N+1). Una imagen borrada o no
// publicada se omite y la siguiente pasa a ser la principal.
export async function resolvePhotos(
  media: MediaReferencesPort,
  products: readonly PublishedProduct[]
): Promise<Map<string, PublicPhotoResult[]>> {
  const ids = [...new Set(products.flatMap((product) => product.photoIds))];
  const alive = new Map((ids.length ? await media.findPublished(ids) : []).map((m) => [m.id, m]));
  return new Map(
    products.map((product) => [
      product.slug,
      product.photoIds.flatMap((id) =>
        alive.has(id) ? [photoOf(alive.get(id) as MediaReference)] : []
      ),
    ])
  );
}

const availabilityOfProduct = (product: PublishedProduct) =>
  aggregateAvailability(product.variants.map((variant) => availabilityOf(variant.available)));

export const toCard = (
  product: PublishedProduct,
  photos: readonly PublicPhotoResult[]
): PublicProductCardResult => ({
  slug: product.slug,
  name: product.name,
  category: { name: product.categoryName, slug: product.categorySlug },
  price: product.price.toDecimal(),
  priceVaries: product.variants.some((variant) => variant.price.cents !== product.price.cents),
  availability: availabilityOfProduct(product),
  photo: photos[0] ?? null,
  updatedAt: product.updatedAt.toISOString(),
});

export const toDetail = (
  product: PublishedProduct,
  photos: readonly PublicPhotoResult[]
): PublicProductResult => {
  const { photo: _main, ...card } = toCard(product, photos);
  return {
    ...card,
    description: product.description,
    photos,
    variants: product.variants.map((variant) => ({
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      price: variant.price.toDecimal(),
      availability: availabilityOf(variant.available),
    })),
  };
};
