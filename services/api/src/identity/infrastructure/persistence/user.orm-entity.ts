import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleOrmEntity } from './user-role.orm-entity.js';

// Modelo de persistencia: NO es la entidad de dominio; el mapper convierte entre ambos.
@Entity({ name: 'users' })
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ name: 'email_verified', type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ name: 'password_hash', type: 'text', nullable: true })
  passwordHash!: string | null;

  @OneToMany(() => UserRoleOrmEntity, (role) => role.user)
  roles!: Relation<UserRoleOrmEntity[]>;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
