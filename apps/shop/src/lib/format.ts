// "349.90" → "Bs 349,90"; "1349.9" → "Bs 1.349,90" (separadores de Bolivia: punto de miles y coma decimal).
export function formatBs(decimal: string): string {
  const [whole = '0', fraction = ''] = decimal.split('.');
  const thousands = whole.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Bs ${thousands},${fraction.padEnd(2, '0').slice(0, 2)}`;
}

export const AVAILABILITY_LABEL = {
  in_stock: 'Disponible',
  low: 'Últimas unidades',
  out: 'Agotada',
} as const;
