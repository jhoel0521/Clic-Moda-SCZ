import type { VariantOption } from './catalog';
import { productPath } from './inquiry';

// La tarjeta del catálogo es UN solo objetivo táctil: abre el detalle con la variante más barata ya elegida.
// Tallas y colores se eligen en el detalle (opciones de 44 px y 8 px de separación), no en la tarjeta.
export interface CardView {
  /** La variante que muestra la tarjeta: la más barata que se puede comprar (o la primera si todo está agotado). */
  featured: VariantOption;
  /** Todo el modelo está agotado: la tarjeta lleva al detalle sin elegir nada. */
  soldOut: boolean;
  /** Resumen en texto de lo disponible ("3 colores · 7 tallas, de 36 a 43"); vacío si no hay nada que sumar. */
  summary: string;
}

const isBuyable = (variant: VariantOption): boolean => variant.availability !== 'out';

const cheapest = (variants: VariantOption[]): VariantOption =>
  variants.reduce((best, next) => (Number(next.price) < Number(best.price) ? next : best));

// La mejor variante: la más barata que se puede comprar; si todo está agotado, la primera.
function bestOf(variants: VariantOption[]): VariantOption {
  const buyable = variants.filter(isBuyable);
  return buyable.length > 0 ? cheapest(buyable) : (variants[0] as VariantOption);
}

const bySize = (a: string, b: string): number => {
  const [na, nb] = [Number(a), Number(b)];
  return !Number.isNaN(na) && !Number.isNaN(nb) ? na - nb : a.localeCompare(b);
};

// "Tallas 36, 37, 43" hasta 4; con más, cuántas hay y entre qué números.
function sizesText(sizes: string[]): string {
  if (sizes.length <= 1) return '';
  if (sizes.length <= 4) return `Tallas ${sizes.join(', ')}`;
  return `${String(sizes.length)} tallas, de ${sizes[0] ?? ''} a ${sizes[sizes.length - 1] ?? ''}`;
}

function summaryOf(variants: readonly VariantOption[]): string {
  const buyable = variants.filter(isBuyable);
  const colors = new Set(buyable.map((variant) => variant.color).filter(Boolean));
  const sizes = [...new Set(buyable.map((variant) => variant.size))].sort(bySize);
  const parts = [colors.size > 1 ? `${String(colors.size)} colores` : '', sizesText(sizes)];
  return parts.filter(Boolean).join(' · ');
}

export function cardView(variants: readonly VariantOption[]): CardView | null {
  if (variants.length === 0) return null;
  const featured = bestOf([...variants]);
  const soldOut = !isBuyable(featured);
  return { featured, soldOut, summary: soldOut ? '' : summaryOf(variants) };
}

// Enlace al detalle con esa talla y color ya elegidos.
export function variantPath(slug: string, { size, color }: VariantOption): string {
  const query = new URLSearchParams({ talla: size });
  if (color) query.set('color', color);
  return `${productPath(slug)}?${query.toString()}`;
}
