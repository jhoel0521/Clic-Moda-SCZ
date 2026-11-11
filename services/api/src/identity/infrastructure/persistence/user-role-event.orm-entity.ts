import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  type Relation,
} from 'typeorm';
import { UserOrmEntity } from './user.orm-entity.js';

// Auditoría de cambios de roles. La clave foránea impide borrar un usuario con historial.
@Entity({ name: 'user_role_events' })
export class UserRoleEventOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserOrmEntity, { onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'user_id' })
  user!: Relation<UserOrmEntity>;

  @Column({ name: 'previous_roles', type: 'text', array: true })
  previousRoles!: string[];

  @Column({ name: 'new_roles', type: 'text', array: true })
  newRoles!: string[];

  @Column({ type: 'text' })
  operator!: string;

  @Column({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;
}
