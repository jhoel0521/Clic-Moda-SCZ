import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import {
  MOVEMENT_TYPES_REPOSITORY,
  type MovementTypesRepository,
} from '../../domain/movement-types.repository.port.js';
import {
  type ListMovementTypesQuery,
  type MovementTypeResult,
  toMovementTypeResult,
} from '../dtos/movement-type.dtos.js';

// Tipos de movimiento: el de sistema primero y luego por fecha de creación. Por omisión solo los activos.
@Injectable()
export class ListMovementTypesUseCase implements UseCase<
  ListMovementTypesQuery,
  MovementTypeResult[]
> {
  constructor(@Inject(MOVEMENT_TYPES_REPOSITORY) private readonly types: MovementTypesRepository) {}

  async execute(query: ListMovementTypesQuery): Promise<MovementTypeResult[]> {
    const found = await this.types.list({ includeInactive: query.includeInactive });
    return found.map(toMovementTypeResult);
  }
}
