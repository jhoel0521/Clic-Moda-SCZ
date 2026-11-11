import { Entity, JoinColumn, ManyToOne, PrimaryColumn, type Relation } from 'typeorm';
import { UserOrmEntity } from './user.orm-entity.js';

// Un usuario puede tener varios roles: una fila por par (usuario, rol).
@Entity({ name: 'user_roles' })
export class UserRoleOrmEntity {
  @PrimaryColumn({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @PrimaryColumn({ type: 'varchar', length: 20 })
  role!: string;

  @ManyToOne(() => UserOrmEntity, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserOrmEntity>;
}
