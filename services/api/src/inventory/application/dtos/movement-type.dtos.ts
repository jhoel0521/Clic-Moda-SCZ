import type { MovementType } from '../../domain/entities/movement-type.entity.js';

export class ListMovementTypesQuery {
  constructor(readonly includeInactive: boolean = false) {}
}

export class CreateMovementTypeCommand {
  constructor(
    readonly name: string,
    readonly kind: string
  ) {}
}

export class RenameMovementTypeCommand {
  constructor(
    readonly code: string,
    readonly name: string
  ) {}
}

export class SetMovementTypeActiveCommand {
  constructor(
    readonly code: string,
    readonly active: boolean
  ) {}
}

export interface MovementTypeResult {
  readonly code: string;
  readonly name: string;
  readonly kind: string;
  readonly active: boolean;
  readonly system: boolean;
  readonly createdAt: string;
}

export const toMovementTypeResult = (type: MovementType): MovementTypeResult => ({
  code: type.code.value,
  name: type.name.value,
  kind: type.kind,
  active: type.active,
  system: type.system,
  createdAt: type.createdAt.toISOString(),
});
