import { Inject, Injectable } from '@nestjs/common';
import { ValidationError } from '../../../shared/domain/errors/domain.error.js';
import type { UseCase } from '../../../shared/application/use-case.js';
import type { User } from '../../domain/entities/user.entity.js';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error.js';
import { USERS_REPOSITORY, type UsersRepository } from '../../domain/users.repository.port.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import type { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';
import { AuthenticateStaffCommand } from '../dtos/authenticate-staff.command.js';
import { AuthenticateStaffResult } from '../dtos/authenticate-staff.result.js';
import {
  ACCESS_TOKEN_ISSUER,
  type AccessTokenIssuerPort,
  type IssuedCredentials,
} from '../ports/access-token-issuer.port.js';
import { PASSWORD_HASHER, type PasswordHasherPort } from '../ports/password-hasher.port.js';

// Techo de la sesión del personal: 8 horas.
export const STAFF_SESSION_MAX_SECONDS = 8 * 60 * 60;

@Injectable()
export class AuthenticateStaffUseCase implements UseCase<
  AuthenticateStaffCommand,
  AuthenticateStaffResult
> {
  private dummyHash: Promise<PasswordHash> | null = null;

  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: PasswordHasherPort,
    @Inject(ACCESS_TOKEN_ISSUER) private readonly tokens: AccessTokenIssuerPort
  ) {}

  async execute(command: AuthenticateStaffCommand): Promise<AuthenticateStaffResult> {
    const user = await this.verifiedStaff(command);
    const credentials = await this.tokens.issue(
      { userId: user.id, roles: user.roles },
      STAFF_SESSION_MAX_SECONDS
    );
    return this.toResult(user, this.withinCeiling(credentials));
  }

  // Correo desconocido, contraseña errónea, cuenta sin contraseña o sin roles: el MISMO error.
  // Si el usuario no existe se verifica igual contra un hash ficticio, para igualar los tiempos.
  private async verifiedStaff(command: AuthenticateStaffCommand): Promise<User> {
    const user = await this.findUser(command.email);
    const hash = user?.passwordHash ?? (await this.dummy());
    const passwordMatches = await this.hasher.verify(command.password, hash);
    if (!user || !user.passwordHash || !passwordMatches || user.roles.length === 0) {
      throw new InvalidCredentialsError();
    }
    return user;
  }

  private async findUser(rawEmail: string): Promise<User | null> {
    try {
      return await this.users.findByEmail(Email.of(rawEmail));
    } catch (error) {
      if (error instanceof ValidationError) return null;
      throw error;
    }
  }

  private dummy(): Promise<PasswordHash> {
    this.dummyHash ??= this.hasher.hash('contraseña-ficticia');
    return this.dummyHash;
  }

  private withinCeiling(credentials: IssuedCredentials): IssuedCredentials {
    if (credentials.expiresInSeconds > STAFF_SESSION_MAX_SECONDS) {
      throw new Error('El emisor de tokens superó el techo de sesión del personal');
    }
    return credentials;
  }

  private toResult(user: User, credentials: IssuedCredentials): AuthenticateStaffResult {
    return new AuthenticateStaffResult(
      credentials.accessToken,
      credentials.refreshToken,
      credentials.expiresInSeconds,
      {
        id: user.id.value,
        email: user.email.value,
        name: user.name.value,
        roles: user.roles.map((role) => role.value),
      }
    );
  }
}
