export class SeedManagerCommand {
  constructor(
    readonly email: string,
    readonly password: string,
    readonly name: string
  ) {}
}

export interface SeedManagerResult {
  // false si ya existía un Gerente (no se hizo nada).
  readonly created: boolean;
  readonly email: string | null;
}
