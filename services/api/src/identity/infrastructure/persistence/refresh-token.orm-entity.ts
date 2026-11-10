import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

// Refresh tokens del paquete de autenticación. `id` es el SHA-256 del token (nunca el token).
@Entity({ name: 'refresh_tokens' })
export class RefreshTokenOrmEntity {
  @PrimaryColumn({ type: 'text' })
  id!: string;

  @Index()
  @Column({ name: 'family_id', type: 'text' })
  familyId!: string;

  @Index()
  @Column({ name: 'user_id', type: 'text' })
  userId!: string;

  @Column({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'family_expires_at', type: 'timestamptz' })
  familyExpiresAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  claims!: Record<string, unknown> | null;
}
