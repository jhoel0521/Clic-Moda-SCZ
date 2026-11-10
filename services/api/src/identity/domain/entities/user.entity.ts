import type { Email } from '../value-objects/email.vo.js';
import type { PasswordHash } from '../value-objects/password-hash.vo.js';
import type { PersonName } from '../value-objects/person-name.vo.js';
import type { Role } from '../value-objects/role.vo.js';
import { UserId } from '../value-objects/user-id.vo.js';

export interface UserProps {
  id: UserId;
  email: Email;
  name: PersonName;
  emailVerified: boolean;
  passwordHash: PasswordHash | null;
  roles: readonly Role[];
}

export interface NewUser {
  email: Email;
  name: PersonName;
  passwordHash?: PasswordHash | null;
}

// Un usuario puede tener varios roles; sin duplicados.
const uniqueRoles = (roles: readonly Role[]): Role[] =>
  roles.filter((role, index) => roles.findIndex((other) => other.equals(role)) === index);

// Entidad: se identifica por su id, no por sus valores.
export class User {
  private constructor(private props: UserProps) {}

  static create(input: NewUser): User {
    return new User({
      id: UserId.generate(),
      email: input.email,
      name: input.name,
      emailVerified: false,
      passwordHash: input.passwordHash ?? null,
      roles: [],
    });
  }

  // Reconstruye una entidad ya existente (la usan los repositorios).
  static rehydrate(props: UserProps): User {
    return new User({ ...props, roles: uniqueRoles(props.roles) });
  }

  get id(): UserId {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): PersonName {
    return this.props.name;
  }

  get emailVerified(): boolean {
    return this.props.emailVerified;
  }

  get passwordHash(): PasswordHash | null {
    return this.props.passwordHash;
  }

  get roles(): readonly Role[] {
    return this.props.roles;
  }

  hasRole(role: Role): boolean {
    return this.props.roles.some((own) => own.equals(role));
  }

  hasAnyRole(roles: readonly Role[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  // Reemplaza el conjunto completo de roles.
  assignRoles(roles: readonly Role[]): void {
    this.props = { ...this.props, roles: uniqueRoles(roles) };
  }

  markEmailVerified(): void {
    this.props = { ...this.props, emailVerified: true };
  }

  equals(other: User): boolean {
    return this.id.equals(other.id);
  }
}
