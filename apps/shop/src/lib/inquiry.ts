import type { Product, VariantOption } from './catalog';
import { whatsappLink } from './whatsapp';

// Dirección canónica de un producto: siempre /p/<slug>, sin talla, color ni ref (no hay páginas duplicadas).
export const productPath = (slug: string): string => `/p/${encodeURIComponent(slug)}`;

export const productUrl = (origin: string, slug: string): string =>
  new URL(productPath(slug), origin.endsWith('/') ? origin : `${origin}/`).toString();

// La variante elegida con ?talla=…&color=…: la talla es obligatoria; el color solo si el producto tiene varios.
export function selectVariant(
  variants: readonly VariantOption[],
  size: string | null,
  color: string | null
): VariantOption | null {
  if (!size) return null;
  const sameSize = variants.filter((variant) => variant.size === size);
  if (color) return sameSize.find((variant) => variant.color === color) ?? null;
  return sameSize.length === 1 ? (sameSize[0] as VariantOption) : null;
}

export interface InquiryInput {
  product: Pick<Product, 'name' | 'slug'>;
  origin: string;
  variant: VariantOption | null;
  ref: string | null;
}

// Mensaje de consulta: producto, talla, color, código y enlace; "Ref" solo si hay referencia.
export function inquiryMessage({ product, origin, variant, ref }: InquiryInput): string {
  const lines = [`Hola, me interesa: ${product.name}`];
  if (variant) lines.push(`Talla: ${variant.size}`);
  if (variant?.color) lines.push(`Color: ${variant.color}`);
  if (variant) lines.push(`Código: ${variant.sku}`);
  lines.push(productUrl(origin, product.slug));
  if (ref) lines.push(`Ref: ${ref}`);
  return lines.join('\n');
}

// Producto agotado: se pregunta cuándo vuelve, sin talla.
export function restockMessage({ product, origin, ref }: Omit<InquiryInput, 'variant'>): string {
  const lines = [
    `Hola, ¿cuándo vuelve a estar disponible: ${product.name}?`,
    productUrl(origin, product.slug),
  ];
  if (ref) lines.push(`Ref: ${ref}`);
  return lines.join('\n');
}

export const inquiryLink = (number: string, message: string): string =>
  whatsappLink(number, message);
