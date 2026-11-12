import type { VariantOption } from './catalog';
import { productPath } from './inquiry';

export interface Swatch {
  color: string;
  /** La variante a la que lleva este color: la más barata que se puede comprar (o la primera). */
  variant: VariantOption;
  active: boolean;
}

export interface CardView {
  /** La variante que muestra la tarjeta: la más barata que se puede comprar (o la primera si todo está agotado). */
  featured: VariantOption;
  /** Tallas DISPONIBLES del color mostrado, ordenadas; las agotadas no se muestran (eso se habla por WhatsApp). */
  chips: VariantOption[];
  /** Un círculo por color que aún tenga alguna talla disponible, en el orden en que aparecen. */
  swatches: Swatch[];
  /** Todo el modelo está agotado: la tarjeta no ofrece tallas ni colores y lleva al detalle. */
  soldOut: boolean;
  /** Las tallas del color mostrado cuestan distinto: cada una lleva su precio. */
  chipPrices: boolean;
}

const bySize = (a: VariantOption, b: VariantOption): number => {
  const [na, nb] = [Number(a.size), Number(b.size)];
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return a.size.localeCompare(b.size);
};

const cheapest = (variants: VariantOption[]): VariantOption =>
  variants.reduce((best, next) => (Number(next.price) < Number(best.price) ? next : best));

const isBuyable = (variant: VariantOption): boolean => variant.availability !== 'out';

// La mejor variante de un grupo: la más barata que se puede comprar; si todo está agotado, la primera.
function bestOf(variants: VariantOption[]): VariantOption {
  const buyable = variants.filter(isBuyable);
  return buyable.length > 0 ? cheapest(buyable) : (variants[0] as VariantOption);
}

function swatchesOf(variants: readonly VariantOption[], featured: VariantOption): Swatch[] {
  const colors = [...new Set(variants.filter(isBuyable).map((variant) => variant.color))].filter(
    (color): color is string => !!color
  );
  return colors.map((color) => ({
    color,
    variant: bestOf(variants.filter((variant) => variant.color === color)),
    active: color === featured.color,
  }));
}

export function cardView(variants: readonly VariantOption[]): CardView | null {
  if (variants.length === 0) return null;
  const featured = bestOf([...variants]);
  const soldOut = !isBuyable(featured);
  const chips = soldOut
    ? []
    : variants.filter((v) => v.color === featured.color && isBuyable(v)).sort(bySize);
  return {
    featured,
    chips,
    soldOut,
    swatches: soldOut ? [] : swatchesOf(variants, featured),
    chipPrices: chips.some((chip) => chip.price !== chips[0]?.price),
  };
}

// Enlace al detalle con esa talla y color ya elegidos.
export function variantPath(slug: string, { size, color }: VariantOption): string {
  const query = new URLSearchParams({ talla: size });
  if (color) query.set('color', color);
  return `${productPath(slug)}?${query.toString()}`;
}
