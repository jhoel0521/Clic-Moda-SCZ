import { AuthenticationModule, AuthenticationStorage } from '@nestjs/authentication';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { Env } from '../shared/infrastructure/config/env.schema.js';
import { ACCESS_TOKEN_ISSUER } from './application/ports/access-token-issuer.port.js';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port.js';
import { AuthenticateStaffUseCase } from './application/use-cases/authenticate-staff.use-case.js';
import { USERS_REPOSITORY } from './domain/users.repository.port.js';
import { AuthenticationAccessTokenIssuer } from './infrastructure/external/authentication-access-token-issuer.js';
import { AuthenticationPasswordHasher } from './infrastructure/external/authentication-password-hasher.js';
import { buildAuthenticationOptions } from './infrastructure/external/authentication.options.js';
import { StaffJwtAuth } from './infrastructure/http/staff-jwt-auth.provider.js';
import { RefreshTokenOrmEntity } from './infrastructure/persistence/refresh-token.orm-entity.js';
import { RevokedRefreshFamilyOrmEntity } from './infrastructure/persistence/revoked-refresh-family.orm-entity.js';
import { TypeOrmRefreshTokenStore } from './infrastructure/persistence/typeorm-refresh-token.store.js';
import { TypeOrmUsersRepository } from './infrastructure/persistence/typeorm-users.repository.js';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity.js';
import { UserRoleOrmEntity } from './infrastructure/persistence/user-role.orm-entity.js';

const AUTH_STORAGE_REGISTRATION = Symbol('AuthStorageRegistration');

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserOrmEntity,
      UserRoleOrmEntity,
      RefreshTokenOrmEntity,
      RevokedRefreshFamilyOrmEntity,
    ]),
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) =>
        buildAuthenticationOptions({
          jwtKey: config.get('AUTH_JWT_KEY', { infer: true }),
          issuer: config.get('AUTH_JWT_ISSUER', { infer: true }),
          audience: config.get('AUTH_JWT_AUDIENCE', { infer: true }),
          scryptLogN: config.get('AUTH_SCRYPT_LOG_N', { infer: true }),
        }),
    }),
  ],
  providers: [
    { provide: USERS_REPOSITORY, useClass: TypeOrmUsersRepository },
    { provide: PASSWORD_HASHER, useClass: AuthenticationPasswordHasher },
    { provide: ACCESS_TOKEN_ISSUER, useClass: AuthenticationAccessTokenIssuer },
    TypeOrmRefreshTokenStore,
    {
      // El paquete exige registrar el almacén de refresh tokens antes de arrancar.
      provide: AUTH_STORAGE_REGISTRATION,
      inject: [AuthenticationStorage, TypeOrmRefreshTokenStore],
      useFactory: (storage: AuthenticationStorage, store: TypeOrmRefreshTokenStore) =>
        storage.registerSource({ refreshTokens: store }),
    },
    StaffJwtAuth,
    AuthenticateStaffUseCase,
  ],
  exports: [USERS_REPOSITORY, AuthenticateStaffUseCase],
})
export class IdentityModule {}
