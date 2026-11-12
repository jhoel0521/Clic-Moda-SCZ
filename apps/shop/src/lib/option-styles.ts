// Estilo de las opciones de talla y color del detalle (botones de radio). Son píldoras redondas de 44 px de
// alto como mínimo con 8 px entre ellas; la elegida va rellena. Nada dentro de una opción puede cambiar su
// tamaño (ni "Últimas" ni "Agotada"): esos avisos van fuera, en el texto de disponibilidad.
export const optionBase =
  'relative inline-flex min-h-11 min-w-12 items-center justify-center gap-2 rounded-full px-3 text-base font-semibold leading-tight transition-colors';

// El estado sale del propio input (:checked, :disabled, :focus-visible).
export const optionRadio =
  'cursor-pointer bg-neutral-100 text-ink has-[:checked]:bg-brand-dark has-[:checked]:text-white has-[:disabled]:cursor-not-allowed has-[:disabled]:text-muted has-[:disabled]:line-through has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand-dark';
