import { MovementType } from './entities/movement-type.entity.js';
import type { CommandType } from './value-objects/command-values.js';
import { TypeCode, TypeName } from './value-objects/type-values.vo.js';

export interface SeedType {
  readonly code: string;
  readonly name: string;
  readonly kind: CommandType;
  readonly system: boolean;
}

// Los tipos con los que nace el sistema: uno de sistema por clase (código igual a la clase, siempre
// activos) y los sugeridos. La migración inserta exactamente estos; una prueba compara ambos.
export const SEED_TYPES: readonly SeedType[] = [
  { code: 'RECEIVE', name: 'Ingreso', kind: 'RECEIVE', system: true },
  { code: 'WITHDRAW', name: 'Retiro', kind: 'WITHDRAW', system: true },
  { code: 'ADJUST', name: 'Ajuste', kind: 'ADJUST', system: true },
  { code: 'PURCHASE', name: 'Ingreso por compra', kind: 'RECEIVE', system: false },
  { code: 'CUSTOMER_RETURN', name: 'Devolución de cliente', kind: 'RECEIVE', system: false },
  { code: 'SALE', name: 'Venta', kind: 'WITHDRAW', system: false },
  { code: 'SHRINKAGE', name: 'Merma o daño', kind: 'WITHDRAW', system: false },
  { code: 'GIFT', name: 'Regalo o muestra', kind: 'WITHDRAW', system: false },
  { code: 'COUNT', name: 'Ajuste por conteo', kind: 'ADJUST', system: false },
];

// Cada tipo nace 1 ms después del anterior: así el orden por fecha de creación es el de la lista.
export const seedMovementTypes = (createdAt: Date): MovementType[] =>
  SEED_TYPES.map((seed, index) =>
    MovementType.restore({
      code: TypeCode.of(seed.code),
      name: TypeName.of(seed.name),
      kind: seed.kind,
      active: true,
      system: seed.system,
      createdAt: new Date(createdAt.getTime() + index),
    })
  );
