import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { USERS_REPOSITORY } from './domain/users.repository.port.js';
import { TypeOrmUsersRepository } from './infrastructure/persistence/typeorm-users.repository.js';
import { UserOrmEntity } from './infrastructure/persistence/user.orm-entity.js';
import { UserRoleOrmEntity } from './infrastructure/persistence/user-role.orm-entity.js';

// Raíz de composición del contexto: enlaza cada puerto con su implementación.
@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity, UserRoleOrmEntity])],
  providers: [{ provide: USERS_REPOSITORY, useClass: TypeOrmUsersRepository }],
  exports: [USERS_REPOSITORY],
})
export class IdentityModule {}
