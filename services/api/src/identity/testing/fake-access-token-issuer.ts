import type {
  AccessTokenIssuerPort,
  IssuedCredentials,
  TokenSubject,
} from '../application/ports/access-token-issuer.port.js';

export class FakeAccessTokenIssuer implements AccessTokenIssuerPort {
  readonly calls: { subject: TokenSubject; maxLifetimeSeconds: number }[] = [];

  // `lifetimeSeconds` permite simular un emisor que incumple el techo.
  constructor(private readonly lifetimeSeconds?: number) {}

  async issue(subject: TokenSubject, maxLifetimeSeconds: number): Promise<IssuedCredentials> {
    this.calls.push({ subject, maxLifetimeSeconds });
    return {
      accessToken: `token-${subject.userId.value}`,
      refreshToken: 'refresh-fake',
      expiresInSeconds: this.lifetimeSeconds ?? maxLifetimeSeconds,
    };
  }
}
