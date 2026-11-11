export class AssignRolesCommand {
  constructor(
    readonly userId: string,
    readonly roles: readonly string[],
    readonly operator: string
  ) {}
}

export interface AssignRolesResult {
  readonly userId: string;
  readonly email: string;
  readonly previousRoles: readonly string[];
  readonly newRoles: readonly string[];
  // false si el usuario ya tenía exactamente esos roles (no se registra nada).
  readonly changed: boolean;
}

export class SearchUsersQuery {
  constructor(
    readonly term: string,
    readonly limit: number
  ) {}
}

export interface UserSummary {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roles: readonly string[];
}
