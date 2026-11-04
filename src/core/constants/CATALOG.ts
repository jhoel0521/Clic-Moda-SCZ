/** Catálogo de la demo: calzado primero, ropa como complemento. */
export const CATEGORIAS = [
  { id: 'tacones', label: 'Tacones', grupo: 'calzado' },
  { id: 'botas', label: 'Botas', grupo: 'calzado' },
  { id: 'sandalias', label: 'Sandalias', grupo: 'calzado' },
  { id: 'zapatillas', label: 'Zapatillas', grupo: 'calzado' },
  { id: 'formales', label: 'Formales', grupo: 'calzado' },
  { id: 'jeans', label: 'Jeans', grupo: 'ropa' },
  { id: 'blusas', label: 'Blusas', grupo: 'ropa' },
  { id: 'vestidos', label: 'Vestidos', grupo: 'ropa' },
  { id: 'chaquetas', label: 'Chaquetas', grupo: 'ropa' },
] as const;

export const TALLAS_CALZADO = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'];
export const TALLAS_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLOR_HEX: Record<string, string> = {
  negro: '#18181b',
  blanco: '#f8f8f6',
  arena: '#d6c4a8',
  crudo: '#ece3d0',
  camel: '#b5803f',
  coñac: '#8f4a25',
  café: '#4b2e1e',
  'café oscuro': '#3a2417',
  vino: '#6d1f2f',
  'azul marino': '#1d2a4d',
  celeste: '#8fb7d9',
  'verde musgo': '#47705f',
  floral: 'linear-gradient(135deg,#e11d48 0%,#2563eb 55%,#f59e0b 100%)',
};

/** Valor CSS para pintar la muestra de un color (si no se conoce, gris neutro). */
export function colorSwatch(name: string): string {
  return COLOR_HEX[name.trim().toLowerCase()] ?? '#a8a29e';
}

/** Largo del pie en cm por talla (referencia para la guía de tallas). */
export const GUIA_CALZADO: Record<string, string> = {
  '35': '22,5',
  '36': '23,0',
  '37': '23,5',
  '38': '24,0',
  '39': '25,0',
  '40': '25,5',
  '41': '26,0',
  '42': '27,0',
  '43': '27,5',
  '44': '28,0',
};
