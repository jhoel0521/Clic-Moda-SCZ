import { TokenService } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import type {
  AccessTokenIssuerPort,
  IssuedCredentials,
  TokenSubject,
} from '../../application/ports/access-token-issuer.port.js';

// Adaptador: TokenService de @nestjs/authentication detrás de nuestro puerto. Los roles NO van en el
// token (el paquete lo desaconseja: quedarían fijos toda la vida de la familia); se leen en cada
// petición, así que un cambio de roles surte efecto de inmediato.
@Injectable()
export class AuthenticationAccessTokenIssuer implements AccessTokenIssuerPort {
  constructor(private readonly tokens: TokenService) {}

  async issue(subject: TokenSubject, maxLifetimeSeconds: number): Promise<IssuedCredentials> {
    const issued = await this.tokens.issue(subject.userId.value, { method: 'password' });
    if (issued.expiresIn > maxLifetimeSeconds) {
      throw new Error('El token de acceso emitido supera el techo de sesión configurado');
    }
    return {
      accessToken: issued.accessToken,
      refreshToken: issued.refreshToken,
      expiresInSeconds: issued.expiresIn,
    };
  }
}
