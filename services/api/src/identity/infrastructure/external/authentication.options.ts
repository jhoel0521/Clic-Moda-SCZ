import type { AuthenticationModuleOptions } from '@nestjs/authentication';
import { STAFF_SESSION_MAX_SECONDS } from '../../application/use-cases/authenticate-staff.use-case.js';

export interface AuthenticationSettings {
  jwtKey: string;
  issuer: string;
  audience: string;
  scryptLogN: number;
}

// Tokens de acceso de 15 minutos (JWT sin estado) y refresh que NUNCA supera el techo de 8 horas del
// personal: ni la vida de un token ni la de toda su familia. Los almacenes que no se usan no se
// configuran; el único con estado es el de refresh tokens (TypeOrmRefreshTokenStore).
export function buildAuthenticationOptions(
  settings: AuthenticationSettings
): AuthenticationModuleOptions {
  const ceilingMs = STAFF_SESSION_MAX_SECONDS * 1000;
  return {
    accessToken: {
      key: settings.jwtKey,
      issuer: settings.issuer,
      audience: settings.audience,
      ttl: '15m',
    },
    refreshToken: { ttl: ceilingMs, absoluteTtl: ceilingMs },
    password: { logN: settings.scryptLogN },
    allowInMemoryStorage: false,
  };
}
