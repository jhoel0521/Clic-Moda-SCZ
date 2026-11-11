// Disponibilidad pública: un ESTADO, nunca la cantidad exacta (no se regala el inventario a la competencia).
export type Availability = 'in_stock' | 'low' | 'out';

// De 1 a LOW_STOCK_MAX unidades se avisa "últimas unidades".
export const LOW_STOCK_MAX = 3;

export function availabilityOf(units: number): Availability {
  if (units <= 0) return 'out';
  return units <= LOW_STOCK_MAX ? 'low' : 'in_stock';
}

// Estado del producto a partir de sus variantes: `out` solo si TODAS están agotadas; `low` si ninguna
// tiene stock normal pero alguna tiene unidades; `in_stock` si alguna tiene stock normal.
export function aggregateAvailability(states: readonly Availability[]): Availability {
  if (states.includes('in_stock')) return 'in_stock';
  return states.includes('low') ? 'low' : 'out';
}
