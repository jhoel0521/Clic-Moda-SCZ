import { Column, Entity, PrimaryColumn } from 'typeorm';

// Familias de refresh tokens revocadas. Vive aparte de los tokens para que la revocación alcance
// también a los tokens que se guarden después (un refresh que perdió una carrera con una reutilización).
@Entity({ name: 'revoked_refresh_families' })
export class RevokedRefreshFamilyOrmEntity {
  @PrimaryColumn({ name: 'family_id', type: 'text' })
  familyId!: string;

  @Column({ name: 'revoked_at', type: 'timestamptz', default: () => 'now()' })
  revokedAt!: Date;

  // Cuándo deja de importar la revocación (fin de vida de la familia); permite limpiar la tabla.
  @Column({ name: 'expires_at', type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;
}
