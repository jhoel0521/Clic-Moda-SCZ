import type { MovementType } from './entities/movement-type.entity.js';
import type { TypeCode } from './value-objects/type-values.vo.js';

// Puerto de repositorio de los tipos de movimiento. Orden estable: el de sistema primero, luego por
// fecha de creación. Nunca se borran: `add` crea (falla si el código ya existe) y `update` guarda el
// nombre y el estado activo (el código y la clase no cambian jamás).
export interface MovementTypesRepository {
  list(options: { includeInactive: boolean }): Promise<MovementType[]>;
  findByCode(code: TypeCode): Promise<MovementType | null>;
  // Todos los códigos usados (activos o no): sirve para generar uno libre a partir del nombre.
  codes(): Promise<ReadonlySet<string>>;
  add(type: MovementType): Promise<void>;
  update(type: MovementType): Promise<void>;
}

export const MOVEMENT_TYPES_REPOSITORY = Symbol('MovementTypesRepository');
