// Los colores del catálogo son nombres ("Coñac", "Azul marino"), sin un tono guardado. Para pintar el círculo
// de la tarjeta se usa este mapa de nombres comunes; lo que no está aquí se pinta neutro con su inicial.
// El círculo es solo apoyo visual: el nombre siempre está en texto (WCAG 1.4.1).
const BY_NAME: Record<string, string> = {
  negro: '#1c1917',
  blanco: '#fafaf9',
  gris: '#9ca3af',
  plata: '#cbd5e1',
  plateado: '#cbd5e1',
  dorado: '#c9a227',
  beige: '#e7d8c3',
  crema: '#f3ead8',
  arena: '#d8c3a5',
  nude: '#e0b9a0',
  camel: '#c19a6b',
  cafe: '#6f4e37',
  'cafe oscuro': '#3e2a20',
  marron: '#7b4a2d',
  conac: '#9a5b2e',
  tabaco: '#8b5a2b',
  miel: '#d4a259',
  rojo: '#c0262d',
  vino: '#6d1a36',
  bordo: '#6d1a36',
  rosa: '#f08fb0',
  fucsia: '#d63384',
  naranja: '#ea7a1f',
  amarillo: '#f2c230',
  verde: '#2f7d4a',
  'verde musgo': '#6b705c',
  oliva: '#6b7036',
  azul: '#2b5fb4',
  'azul marino': '#14274e',
  celeste: '#7fb7e6',
  turquesa: '#2bb3a8',
  morado: '#6d3b9a',
  lila: '#b79ad8',
};

const normalize = (name: string): string =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toLowerCase();

// Tono del color por su nombre, o null si no se conoce (el círculo se pinta neutro).
export const colorHex = (name: string): string | null => BY_NAME[normalize(name)] ?? null;

// "Floral", "Rayas"…: estampados, no un tono. Se pintan con un degradado en vez de un color liso.
export const isPattern = (name: string): boolean =>
  ['floral', 'rayas', 'animal print', 'estampado', 'multicolor'].includes(normalize(name));

export const initialOf = (name: string): string => name.trim().charAt(0).toUpperCase();
