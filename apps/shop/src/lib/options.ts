import type { VariantOption } from './catalog';

// Una opción (talla o color) está en "últimas unidades" cuando TODO lo que se puede comprar de ella lo está:
// si hay otra variante con stock normal, no se avisa (la elección todavía no está agotándose).
export function lowOnly(variants: readonly VariantOption[]): boolean {
  const buyable = variants.filter((variant) => variant.availability !== 'out');
  return buyable.length > 0 && buyable.every((variant) => variant.availability === 'low');
}

// Una opción está agotada solo si TODAS las variantes que la cumplen lo están.
export const allOut = (variants: readonly VariantOption[]): boolean =>
  variants.every((variant) => variant.availability === 'out');

// Las opciones agotadas no se muestran mientras haya otras disponibles (eso se habla por WhatsApp). Si TODO
// está agotado se dejan a la vista, desactivadas, y el botón pregunta cuándo vuelve.
export function onlyAvailable(values: string[], out: (value: string) => boolean): string[] {
  const available = values.filter((value) => !out(value));
  return available.length > 0 ? available : values;
}
