import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  MOVEMENT_TYPES_REPOSITORY,
  type MovementTypesRepository,
} from '../../domain/movement-types.repository.port.js';
import {
  type MovementTypeResult,
  type SetMovementTypeActiveCommand,
  toMovementTypeResult,
} from '../dtos/movement-type.dtos.js';
import { requireType } from '../support/movement-type-access.js';

// Activa o desactiva un tipo. Un tipo de sistema no se desactiva. Desactivar no toca comandos ya
// aceptados: se procesan igual; solo se rechazan los comandos nuevos con ese tipo.
@Injectable()
export class SetMovementTypeActiveUseCase implements UseCase<
  SetMovementTypeActiveCommand,
  MovementTypeResult
> {
  constructor(@Inject(MOVEMENT_TYPES_REPOSITORY) private readonly types: MovementTypesRepository) {}

  async execute(command: SetMovementTypeActiveCommand): Promise<MovementTypeResult> {
    const type = await requireType(this.types, command.code);
    if (command.active) type.activate();
    else type.deactivate();
    await this.types.update(type);
    return toMovementTypeResult(type);
  }
}
