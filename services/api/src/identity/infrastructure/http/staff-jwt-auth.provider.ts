import { AuthenticationRegistry, type JwtClaims, JwtBearerProvider } from '@nestjs/authentication';
import { Inject, Injectable } from '@nestjs/common';
import type { User } from '../../domain/entities/user.entity.js';
import { USERS_REPOSITORY, type UsersRepository } from '../../domain/users.repository.port.js';
import { UserId } from '../../domain/value-objects/user-id.vo.js';

// Valida el token de acceso y carga al usuario con sus roles ACTUALES desde nuestro repositorio.
// Devolver null rechaza el token: usuario inexistente, token mal formado o cuenta sin roles.
@Injectable()
export class StaffJwtAuth extends JwtBearerProvider<User> {
  constructor(
    @Inject(USERS_REPOSITORY) private readonly users: UsersRepository,
    registry: AuthenticationRegistry
  ) {
    super();
    registry.registerProvider(this);
  }

  protected async validate(claims: JwtClaims): Promise<User | null> {
    const id = this.parseId(claims.sub);
    const user = id ? await this.users.findById(id) : null;
    return user && user.roles.length > 0 ? user : null;
  }

  private parseId(subject: string | undefined): UserId | null {
    try {
      return subject ? UserId.of(subject) : null;
    } catch {
      return null;
    }
  }
}
