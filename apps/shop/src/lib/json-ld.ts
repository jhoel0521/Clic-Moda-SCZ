import type { Availability, Product } from './catalog';
import { productUrl } from './inquiry';

// `set:html` NO escapa: un nombre con `</script>` cerraría el bloque. Se serializa con JSON.stringify y se
// reemplazan `<`, `>`, `&` y los separadores de línea Unicode por su escape \uXXXX (sigue siendo JSON válido).
const ESCAPES: Record<string, string> = {
  '<': '\\u003c',
  '>': '\\u003e',
  '&': '\\u0026',
  '\u2028': '\\u2028',
  '\u2029': '\\u2029',
};

export const safeJsonLd = (data: unknown): string =>
  JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => ESCAPES[char] as string);

const SCHEMA_AVAILABILITY: Record<Availability, string> = {
  in_stock: 'https://schema.org/InStock',
  low: 'https://schema.org/LimitedAvailability',
  out: 'https://schema.org/OutOfStock',
};

const absolute = (origin: string, path: string): string =>
  new URL(path, origin.endsWith('/') ? origin : `${origin}/`).toString();

// Datos estructurados `Product` con una oferta por variante (SKU, precio en BOB y disponibilidad).
export function productJsonLd(product: Product, origin: string): Record<string, unknown> {
  const url = productUrl(origin, product.slug);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.photos.map((photo) => absolute(origin, photo.link)),
    category: product.category.name,
    sku: product.variants[0]?.sku,
    url,
    offers: product.variants.map((variant) => ({
      '@type': 'Offer',
      sku: variant.sku,
      price: variant.price,
      priceCurrency: 'BOB',
      availability: SCHEMA_AVAILABILITY[variant.availability],
      url,
    })),
  };
}
