import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  MOVEMENT_TYPES_REPOSITORY,
  type MovementTypesRepository,
} from '../../domain/movement-types.repository.port.js';
import {
  type MovementTypeResult,
  type RenameMovementTypeCommand,
  toMovementTypeResult,
} from '../dtos/movement-type.dtos.js';
import { parseName, requireType } from '../support/movement-type-access.js';

// Cambia solo el nombre: el código y la clase no cambian jamás (el historial conserva sus códigos).
@Injectable()
export class RenameMovementTypeUseCase implements UseCase<
  RenameMovementTypeCommand,
  MovementTypeResult
> {
  constructor(@Inject(MOVEMENT_TYPES_REPOSITORY) private readonly types: MovementTypesRepository) {}

  async execute(command: RenameMovementTypeCommand): Promise<MovementTypeResult> {
    const type = await requireType(this.types, command.code);
    type.rename(parseName(command.name));
    await this.types.update(type);
    return toMovementTypeResult(type);
  }
}
