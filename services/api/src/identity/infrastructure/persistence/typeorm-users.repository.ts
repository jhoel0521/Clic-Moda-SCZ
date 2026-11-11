import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, ILike, QueryFailedError, Repository } from 'typeorm';
import { ConflictError } from '../../../shared/domain/errors/domain.error.js';
import type { User } from '../../domain/entities/user.entity.js';
import type { UsersRepository } from '../../domain/users.repository.port.js';
import type { Email } from '../../domain/value-objects/email.vo.js';
import type { Role } from '../../domain/value-objects/role.vo.js';
import type { UserId } from '../../domain/value-objects/user-id.vo.js';
import { UserMapper } from './user.mapper.js';
import { UserOrmEntity } from './user.orm-entity.js';
import { UserRoleOrmEntity } from './user-role.orm-entity.js';

const UNIQUE_VIOLATION = '23505';
const escapeLike = (term: string): string => term.replace(/[\\%_]/g, (char) => `\\${char}`);

@Injectable()
export class TypeOrmUsersRepository implements UsersRepository {
  constructor(
    @InjectRepository(UserOrmEntity) private readonly users: Repository<UserOrmEntity>,
    private readonly dataSource: DataSource
  ) {}

  async findById(id: UserId): Promise<User | null> {
    const row = await this.users.findOne({ where: { id: id.value }, relations: { roles: true } });
    return row ? UserMapper.toDomain(row) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const row = await this.users.findOne({
      where: { email: email.value },
      relations: { roles: true },
    });
    return row ? UserMapper.toDomain(row) : null;
  }

  async search(term: string, limit: number): Promise<User[]> {
    const like = ILike(`%${escapeLike(term.trim())}%`);
    const rows = await this.users.find({
      where: [{ name: like }, { email: like }],
      relations: { roles: true },
      order: { name: 'ASC' },
      take: limit,
    });
    return rows.map((row) => UserMapper.toDomain(row));
  }

  countWithRole(role: Role): Promise<number> {
    return this.dataSource.getRepository(UserRoleOrmEntity).countBy({ role: role.value });
  }

  async save(user: User): Promise<void> {
    try {
      await this.dataSource.transaction((manager) => this.persist(manager, user));
    } catch (error) {
      throw this.translate(error, user);
    }
  }

  // Crea o actualiza el usuario y reemplaza su conjunto de roles DENTRO de la transacción dada. Es
  // público para que otros repositorios (p. ej. el de eventos de roles) la compartan.
  async persist(manager: EntityManager, user: User): Promise<void> {
    const { user: row, roles } = UserMapper.toRows(user);
    await manager.save(UserOrmEntity, row);
    await manager.delete(UserRoleOrmEntity, { userId: row.id });
    if (roles.length > 0) await manager.insert(UserRoleOrmEntity, roles);
  }

  private translate(error: unknown, user: User): unknown {
    const code =
      error instanceof QueryFailedError ? (error.driverError as { code?: string }).code : '';
    return code === UNIQUE_VIOLATION
      ? new ConflictError(`El correo ${user.email.value} ya está registrado`)
      : error;
  }
}
