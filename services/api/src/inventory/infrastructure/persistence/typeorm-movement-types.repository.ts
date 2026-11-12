import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { MovementType } from '../../domain/entities/movement-type.entity.js';
import { MovementTypeCodeTakenError } from '../../domain/errors/movement-type.errors.js';
import type { MovementTypesRepository } from '../../domain/movement-types.repository.port.js';
import { parseCommandType } from '../../domain/value-objects/command-values.js';
import { TypeCode, TypeName } from '../../domain/value-objects/type-values.vo.js';

interface TypeRow {
  code: string;
  name: string;
  kind: string;
  active: boolean;
  system: boolean;
  created_at: Date;
}

const toType = (row: TypeRow): MovementType =>
  MovementType.restore({
    code: TypeCode.of(row.code),
    name: TypeName.of(row.name),
    kind: parseCommandType(row.kind),
    active: row.active,
    system: row.system,
    createdAt: row.created_at,
  });

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class TypeOrmMovementTypesRepository implements MovementTypesRepository {
  constructor(private readonly dataSource: DataSource) {}

  async list(options: { includeInactive: boolean }): Promise<MovementType[]> {
    const rows: TypeRow[] = await this.dataSource.query(
      `SELECT * FROM movement_types WHERE ($1::boolean OR active)
       ORDER BY system DESC, created_at, code`,
      [options.includeInactive]
    );
    return rows.map(toType);
  }

  async findByCode(code: TypeCode): Promise<MovementType | null> {
    const rows: TypeRow[] = await this.dataSource.query(
      'SELECT * FROM movement_types WHERE code = $1',
      [code.value]
    );
    return rows[0] ? toType(rows[0]) : null;
  }

  async codes(): Promise<ReadonlySet<string>> {
    const rows: { code: string }[] = await this.dataSource.query('SELECT code FROM movement_types');
    return new Set(rows.map((row) => row.code));
  }

  // Un código repetido (otra creación a la vez) falla con un error de dominio, nunca pisa al anterior.
  async add(type: MovementType): Promise<void> {
    try {
      await this.dataSource.query(
        `INSERT INTO movement_types (code, name, kind, active, system, created_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [type.code.value, type.name.value, type.kind, type.active, type.system, type.createdAt]
      );
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new MovementTypeCodeTakenError();
      }
      throw error;
    }
  }

  // Solo nombre y estado: el código y la clase no cambian (también lo impide un trigger en la base).
  async update(type: MovementType): Promise<void> {
    await this.dataSource.query(
      'UPDATE movement_types SET name = $2, active = $3 WHERE code = $1',
      [type.code.value, type.name.value, type.active]
    );
  }
}
