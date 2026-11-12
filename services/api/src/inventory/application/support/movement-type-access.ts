import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import type { MovementType } from '../../domain/entities/movement-type.entity.js';
import { MovementTypeNotFoundError } from '../../domain/errors/movement-type.errors.js';
import type { MovementTypesRepository } from '../../domain/movement-types.repository.port.js';
import { TypeCode, TypeName } from '../../domain/value-objects/type-values.vo.js';

// Busca un tipo por su código o falla como "no existe" (un código mal escrito también es "no existe").
export async function requireType(
  types: MovementTypesRepository,
  rawCode: string
): Promise<MovementType> {
  let code: TypeCode;
  try {
    code = TypeCode.of(rawCode);
  } catch {
    throw new MovementTypeNotFoundError();
  }
  const found = await types.findByCode(code);
  if (!found) throw new MovementTypeNotFoundError();
  return found;
}

// El nombre inválido se informa junto a su campo (el formulario marca el error en el nombre).
export function parseName(raw: string): TypeName {
  try {
    return TypeName.of(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Nombre inválido';
    throw new FieldValidationError([{ field: 'name', message }]);
  }
}
