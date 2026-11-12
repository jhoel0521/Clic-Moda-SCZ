import type { VariantOption } from './catalog';
import { formatBs } from './format';

interface PricedProduct {
  price: string; // el menor precio de sus variantes
  priceVaries: boolean;
}

// Tarjeta del catálogo: si las tallas o colores cuestan distinto, el precio dice "Desde".
export const cardPrice = ({ price, priceVaries }: PricedProduct): string =>
  priceVaries ? `Desde ${formatBs(price)}` : formatBs(price);

export interface PriceView {
  text: string;
  /** A qué se refiere el precio: la variante elegida, o todas, o "elige para ver". */
  note: string;
}

const describeVariant = ({ size, color }: VariantOption): string =>
  color ? `Talla ${size} · ${color}` : `Talla ${size}`;

// Precio que se ve en el detalle y siempre dice A QUÉ aplica, aunque todas valgan lo mismo.
export function priceView(product: PricedProduct, chosen: VariantOption | null): PriceView {
  if (chosen) return { text: formatBs(chosen.price), note: describeVariant(chosen) };
  if (product.priceVaries) {
    return {
      text: cardPrice(product),
      note: 'Elige talla y color para ver su precio',
    };
  }
  return { text: formatBs(product.price), note: 'El mismo precio en todas las tallas y colores' };
}

// Precio bajo una opción de talla o color (solo cuando el modelo tiene precios distintos).
export function optionPrice(variants: readonly VariantOption[]): string | null {
  const cents = variants.map((variant) => variant.price);
  if (cents.length === 0) return null;
  const lowest = cents.reduce((a, b) => (Number(a) <= Number(b) ? a : b));
  return cents.every((price) => price === lowest) ? formatBs(lowest) : `Desde ${formatBs(lowest)}`;
}
