import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { UserId } from '../../domain/value-objects/user-id.vo.js';
import { UserOrmEntity } from './user.orm-entity.js';
import { UserRoleOrmEntity } from './user-role.orm-entity.js';

export interface UserRows {
  user: UserOrmEntity;
  roles: UserRoleOrmEntity[];
}

// Frontera dominio <-> persistencia: las entidades de TypeORM nunca entran al dominio.
export class UserMapper {
  static toDomain(row: UserOrmEntity): User {
    return User.rehydrate({
      id: UserId.of(row.id),
      email: Email.of(row.email),
      name: PersonName.of(row.name),
      emailVerified: row.emailVerified,
      passwordHash: row.passwordHash ? PasswordHash.of(row.passwordHash) : null,
      roles: (row.roles ?? []).map((own) => Role.of(own.role)),
    });
  }

  static toRows(user: User): UserRows {
    const row = new UserOrmEntity();
    row.id = user.id.value;
    row.email = user.email.value;
    row.name = user.name.value;
    row.emailVerified = user.emailVerified;
    row.passwordHash = user.passwordHash?.value ?? null;
    return { user: row, roles: user.roles.map((role) => UserMapper.roleRow(user, role)) };
  }

  private static roleRow(user: User, role: Role): UserRoleOrmEntity {
    const roleRow = new UserRoleOrmEntity();
    roleRow.userId = user.id.value;
    roleRow.role = role.value;
    return roleRow;
  }
}
