import type { VariantId } from '../../domain/value-objects/ids.vo.js';

// Puerto de aplicación hacia el inventario: ¿la variante ya tiene movimientos? Con movimientos
// su SKU no puede cambiar. `catalog` no importa código de `inventory`: lo implementa infraestructura.
export interface VariantHasMovementsPort {
  hasMovements(id: VariantId): Promise<boolean>;
}

export const VARIANT_HAS_MOVEMENTS = Symbol('VariantHasMovementsPort');
