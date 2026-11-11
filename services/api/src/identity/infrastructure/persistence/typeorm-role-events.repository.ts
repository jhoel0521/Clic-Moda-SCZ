import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { User } from '../../domain/entities/user.entity.js';
import type { RoleEvent } from '../../domain/role-event.js';
import type { RoleEventsRepository } from '../../domain/role-events.repository.port.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { UserId } from '../../domain/value-objects/user-id.vo.js';
import { TypeOrmUsersRepository } from './typeorm-users.repository.js';
import { UserRoleEventOrmEntity } from './user-role-event.orm-entity.js';

const toRow = (event: RoleEvent): UserRoleEventOrmEntity => {
  const row = new UserRoleEventOrmEntity();
  row.id = event.id;
  row.userId = event.userId.value;
  row.previousRoles = event.previousRoles.map((role) => role.value);
  row.newRoles = event.newRoles.map((role) => role.value);
  row.operator = event.operator;
  row.occurredAt = event.occurredAt;
  return row;
};

const toDomain = (row: UserRoleEventOrmEntity): RoleEvent => ({
  id: row.id,
  userId: UserId.of(row.userId),
  previousRoles: row.previousRoles.map((raw) => Role.of(raw)),
  newRoles: row.newRoles.map((raw) => Role.of(raw)),
  operator: row.operator,
  occurredAt: row.occurredAt,
});

@Injectable()
export class TypeOrmRoleEventsRepository implements RoleEventsRepository {
  constructor(
    private readonly dataSource: DataSource,
    private readonly users: TypeOrmUsersRepository
  ) {}

  // Usuario y evento en UNA transacción: si falla el evento (p. ej. clave foránea), el usuario no cambia.
  async applyChange(user: User, event: RoleEvent): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await this.users.persist(manager, user);
      await manager.insert(UserRoleEventOrmEntity, toRow(event));
    });
  }

  async listByUser(userId: UserId): Promise<RoleEvent[]> {
    const rows = await this.dataSource.getRepository(UserRoleEventOrmEntity).find({
      where: { userId: userId.value },
      order: { occurredAt: 'DESC' },
    });
    return rows.map(toDomain);
  }
}
