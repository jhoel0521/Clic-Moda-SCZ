import type { Role } from '../../domain/value-objects/role.vo.js';
import type { UserId } from '../../domain/value-objects/user-id.vo.js';

export interface TokenSubject {
  userId: UserId;
  roles: readonly Role[];
}

export interface IssuedCredentials {
  accessToken: string;
  refreshToken: string | null;
  expiresInSeconds: number;
}

// El emisor DEBE respetar `maxLifetimeSeconds`: es el techo de la sesión.
export interface AccessTokenIssuerPort {
  issue(subject: TokenSubject, maxLifetimeSeconds: number): Promise<IssuedCredentials>;
}

export const ACCESS_TOKEN_ISSUER = Symbol('AccessTokenIssuer');
