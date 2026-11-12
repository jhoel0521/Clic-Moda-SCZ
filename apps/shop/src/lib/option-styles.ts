// Estilo ÚNICO de las opciones de talla y color: la tarjeta del catálogo (enlaces) y el selector del detalle
// (botones de radio) usan estas mismas clases, solo cambia el tamaño. Así lo que se ve en el listado es lo mismo
// que se elige en el producto. Nada dentro de una opción puede cambiar su tamaño (ni "Últimas" ni "Agotada"):
// esos avisos van fuera, en el texto de disponibilidad.
export type OptionSize = 'sm' | 'lg';

const BASE =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold leading-tight transition-colors';

const SIZES: Record<OptionSize, string> = {
  sm: 'min-h-9 min-w-10 px-2 text-sm',
  lg: 'min-h-11 min-w-12 px-3 text-base',
};

// Enlaces (tarjeta): la opción elegida va rellena y se marca además con aria-current.
export const optionBase = (size: OptionSize): string => `${BASE} ${SIZES[size]}`;

export const optionLink = (selected: boolean): string =>
  selected ? 'bg-brand-dark text-white' : 'bg-neutral-100 text-ink hover:bg-brand-soft';

// Botones de radio (detalle): el estado sale del propio input (:checked, :disabled, :focus-visible).
export const optionRadio =
  'cursor-pointer bg-neutral-100 text-ink has-[:checked]:bg-brand-dark has-[:checked]:text-white has-[:disabled]:cursor-not-allowed has-[:disabled]:text-muted has-[:disabled]:line-through has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark';
