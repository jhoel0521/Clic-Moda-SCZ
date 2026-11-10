import { ValueObject } from '../../../shared/domain/value-object.js';
import { InvalidRoleError } from '../errors/invalid-value.errors.js';

export const ROLE_VALUES = ['GERENTE', 'DESPACHO', 'ATENCION'] as const;
export type RoleValue = (typeof ROLE_VALUES)[number];

const isRoleValue = (value: string): value is RoleValue =>
  (ROLE_VALUES as readonly string[]).includes(value);

export class Role extends ValueObject<{ value: RoleValue }> {
  static readonly GERENTE = new Role({ value: 'GERENTE' });
  static readonly DESPACHO = new Role({ value: 'DESPACHO' });
  static readonly ATENCION = new Role({ value: 'ATENCION' });

  static of(raw: string): Role {
    const value = raw.trim().toUpperCase();
    if (!isRoleValue(value)) throw new InvalidRoleError(raw);
    return new Role({ value });
  }

  static all(): Role[] {
    return ROLE_VALUES.map((value) => Role.of(value));
  }

  get value(): RoleValue {
    return this.props.value;
  }
}
