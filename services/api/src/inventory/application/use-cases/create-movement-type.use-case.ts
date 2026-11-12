import { Inject, Injectable } from '@nestjs/common';
import type { UseCase } from '../../../shared/application/use-case.js';
import { FieldValidationError } from '../../../shared/domain/errors/domain.error.js';
import { MovementType } from '../../domain/entities/movement-type.entity.js';
import { InvalidCommandTypeError } from '../../domain/errors/inventory.errors.js';
import { MovementTypeCodeTakenError } from '../../domain/errors/movement-type.errors.js';
import {
  MOVEMENT_TYPES_REPOSITORY,
  type MovementTypesRepository,
} from '../../domain/movement-types.repository.port.js';
import { type CommandType, parseCommandType } from '../../domain/value-objects/command-values.js';
import {
  type CreateMovementTypeCommand,
  type MovementTypeResult,
  toMovementTypeResult,
} from '../dtos/movement-type.dtos.js';
import { CLOCK, type ClockPort } from '../ports/inventory.ports.js';
import { parseName } from '../support/movement-type-access.js';

const MAX_ATTEMPTS = 3;

function parseKind(raw: string): CommandType {
  try {
    return parseCommandType(raw);
  } catch (error) {
    if (!(error instanceof InvalidCommandTypeError)) throw error;
    throw new FieldValidationError([{ field: 'kind', message: error.message }]);
  }
}

// Crea un tipo nuevo: el código sale del nombre (con sufijo si ya existe) y la persona nunca lo escribe.
@Injectable()
export class CreateMovementTypeUseCase implements UseCase<
  CreateMovementTypeCommand,
  MovementTypeResult
> {
  constructor(
    @Inject(MOVEMENT_TYPES_REPOSITORY) private readonly types: MovementTypesRepository,
    @Inject(CLOCK) private readonly clock: ClockPort
  ) {}

  async execute(command: CreateMovementTypeCommand): Promise<MovementTypeResult> {
    const name = parseName(command.name);
    const kind = parseKind(command.kind);
    for (let attempt = 1; ; attempt += 1) {
      const taken = await this.types.codes();
      const type = MovementType.create({ name, kind, takenCodes: taken }, this.clock.now());
      try {
        await this.types.add(type);
        return toMovementTypeResult(type);
      } catch (error) {
        // Otra creación se quedó con ese código a la vez: se recalcula con los códigos actuales.
        if (!(error instanceof MovementTypeCodeTakenError) || attempt >= MAX_ATTEMPTS) throw error;
      }
    }
  }
}
