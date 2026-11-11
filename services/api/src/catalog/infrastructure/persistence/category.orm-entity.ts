import { Column, Entity, PrimaryColumn } from 'typeorm';

// Modelo de persistencia: NO es la entidad de dominio; el mapper convierte entre ambos.
@Entity({ name: 'categories' })
export class CategoryOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ type: 'citext', unique: true })
  name!: string;

  @Column({ type: 'text', unique: true })
  slug!: string;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
