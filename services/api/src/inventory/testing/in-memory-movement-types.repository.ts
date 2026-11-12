import type { MovementType } from '../domain/entities/movement-type.entity.js';
import { MovementTypeCodeTakenError } from '../domain/errors/movement-type.errors.js';
import { seedMovementTypes } from '../domain/movement-type-seed.js';
import type { MovementTypesRepository } from '../domain/movement-types.repository.port.js';
import type { TypeCode } from '../domain/value-objects/type-values.vo.js';

// Fake en memoria del repositorio de tipos: mismo orden que el real (sistema primero, luego creación).
export class InMemoryMovementTypesRepository implements MovementTypesRepository {
  private readonly types = new Map<string, MovementType>();

  constructor(initial: readonly MovementType[] = []) {
    for (const type of initial) this.types.set(type.code.value, type);
  }

  // Un repositorio con los tipos con los que nace el sistema (lo que deja la migración).
  static seeded(createdAt: Date = new Date()): InMemoryMovementTypesRepository {
    return new InMemoryMovementTypesRepository(seedMovementTypes(createdAt));
  }

  async list(options: { includeInactive: boolean }): Promise<MovementType[]> {
    return [...this.types.values()]
      .filter((type) => options.includeInactive || type.active)
      .sort(
        (a, b) =>
          Number(b.system) - Number(a.system) || a.createdAt.getTime() - b.createdAt.getTime()
      );
  }

  async findByCode(code: TypeCode): Promise<MovementType | null> {
    return this.types.get(code.value) ?? null;
  }

  async codes(): Promise<ReadonlySet<string>> {
    return new Set(this.types.keys());
  }

  async add(type: MovementType): Promise<void> {
    if (this.types.has(type.code.value)) throw new MovementTypeCodeTakenError();
    this.types.set(type.code.value, type);
  }

  async update(type: MovementType): Promise<void> {
    this.types.set(type.code.value, type);
  }
}
