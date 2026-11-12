import type { VariantOption } from './catalog';
import { productPath } from './inquiry';

export interface CardView {
  /** La variante que muestra la tarjeta: la más barata que se puede comprar (o la primera si todo está agotado). */
  featured: VariantOption;
  /** Tallas del color mostrado, ordenadas; cada una es un enlace a esa talla y color. */
  chips: VariantOption[];
  /** Cuántos colores más tiene el modelo, sin contar el mostrado. */
  moreColors: number;
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

export function cardView(variants: readonly VariantOption[]): CardView | null {
  const first = variants[0];
  if (!first) return null;
  const buyable = variants.filter((variant) => variant.availability !== 'out');
  const featured = buyable.length > 0 ? cheapest(buyable) : first;
  const chips = variants.filter((variant) => variant.color === featured.color).sort(bySize);
  const colors = new Set(variants.map((variant) => variant.color));
  return {
    featured,
    chips,
    moreColors: colors.size - 1,
    chipPrices: chips.some((chip) => chip.price !== chips[0]?.price),
  };
}

// Enlace al detalle con esa talla y color ya elegidos.
export function variantPath(slug: string, { size, color }: VariantOption): string {
  const query = new URLSearchParams({ talla: size });
  if (color) query.set('color', color);
  return `${productPath(slug)}?${query.toString()}`;
}
