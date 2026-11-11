export interface AuthenticatedStaff {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly roles: readonly string[];
}

// Resultado del caso de uso. Nunca contiene contraseña ni hash.
export class AuthenticateStaffResult {
  constructor(
    readonly accessToken: string,
    readonly refreshToken: string | null,
    readonly expiresInSeconds: number,
    readonly user: AuthenticatedStaff
  ) {}
}
