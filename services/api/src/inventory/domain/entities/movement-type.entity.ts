import {
  MovementTypeInactiveError,
  MovementTypeKindMismatchError,
  SystemTypeProtectedError,
} from '../errors/movement-type.errors.js';
import type { CommandType } from '../value-objects/command-values.js';
import { TypeCode, type TypeName } from '../value-objects/type-values.vo.js';

export interface MovementTypeProps {
  code: TypeCode;
  name: TypeName;
  kind: CommandType; // la clase decide cómo cambia el stock; el tipo solo dice por qué
  active: boolean;
  system: boolean;
  createdAt: Date;
}

export interface NewMovementType {
  name: TypeName;
  kind: CommandType;
  takenCodes: ReadonlySet<string>;
}

// Tipo de movimiento: un dato administrable. El código y la clase nunca cambian; no se borra, se
// desactiva (salvo los de sistema, uno por clase, que siempre están activos).
export class MovementType {
  private constructor(private props: MovementTypeProps) {}

  static create(input: NewMovementType, now: Date): MovementType {
    return new MovementType({
      code: TypeCode.fromName(input.name, input.takenCodes),
      name: input.name,
      kind: input.kind,
      active: true,
      system: false,
      createdAt: now,
    });
  }

  static restore(props: MovementTypeProps): MovementType {
    return new MovementType({ ...props });
  }

  rename(name: TypeName): void {
    this.props = { ...this.props, name };
  }

  activate(): void {
    this.props = { ...this.props, active: true };
  }

  deactivate(): void {
    if (this.props.system) throw new SystemTypeProtectedError();
    this.props = { ...this.props, active: false };
  }

  // ¿Sirve para un comando nuevo de esa clase? Debe estar activo y ser de la misma clase.
  assertUsableFor(kind: CommandType): void {
    if (!this.props.active) throw new MovementTypeInactiveError();
    if (this.props.kind !== kind) throw new MovementTypeKindMismatchError();
  }

  get snapshot(): Readonly<MovementTypeProps> {
    return this.props;
  }

  get code(): TypeCode {
    return this.props.code;
  }

  get name(): TypeName {
    return this.props.name;
  }

  get kind(): CommandType {
    return this.props.kind;
  }

  get active(): boolean {
    return this.props.active;
  }

  get system(): boolean {
    return this.props.system;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }
}
