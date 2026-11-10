import type { RefreshTokenRecord, RefreshTokenStore } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface RefreshTokenRow {
  id: string;
  family_id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
  family_expires_at: Date;
  used_at: Date | null;
  claims: Record<string, unknown> | null;
}

// El contrato del paquete pide campos opcionales ausentes (undefined), nunca null.
const toRecord = (row: RefreshTokenRow): RefreshTokenRecord => ({
  id: row.id,
  familyId: row.family_id,
  userId: row.user_id,
  createdAt: row.created_at,
  expiresAt: row.expires_at,
  familyExpiresAt: row.family_expires_at,
  ...(row.used_at ? { usedAt: row.used_at } : {}),
  ...(row.claims ? { claims: row.claims } : {}),
});

// Almacén de refresh tokens sobre Postgres. El paquete exige que las operaciones sensibles sean UNA
// sola escritura condicional (nunca leer y luego escribir) para detectar reutilización bajo carrera.
@Injectable()
export class TypeOrmRefreshTokenStore implements RefreshTokenStore {
  constructor(private readonly dataSource: DataSource) {}

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const rows: RefreshTokenRow[] = await this.dataSource.query(
      'SELECT * FROM refresh_tokens WHERE id = $1',
      [id]
    );
    return rows[0] ? toRecord(rows[0]) : undefined;
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO refresh_tokens
         (id, family_id, user_id, created_at, expires_at, family_expires_at, used_at, claims)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        record.id,
        record.familyId,
        record.userId,
        record.createdAt,
        record.expiresAt,
        record.familyExpiresAt,
        record.usedAt ?? null,
        record.claims ? JSON.stringify(record.claims) : null,
      ]
    );
    await this.purgeExpired(record.createdAt);
  }

  // `true` solo para UNA de varias llamadas concurrentes: es un compare-and-set.
  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    const rows: { n: number }[] = await this.dataSource.query(
      `WITH updated AS (
         UPDATE refresh_tokens SET used_at = $2 WHERE id = $1 AND used_at IS NULL RETURNING id
       ) SELECT count(*)::int AS n FROM updated`,
      [id, at]
    );
    return rows[0].n === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO revoked_refresh_families (family_id, expires_at)
       VALUES ($1, (SELECT max(family_expires_at) FROM refresh_tokens WHERE family_id = $1))
       ON CONFLICT (family_id) DO NOTHING`,
      [familyId]
    );
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const rows: unknown[] = await this.dataSource.query(
      'SELECT 1 FROM revoked_refresh_families WHERE family_id = $1',
      [familyId]
    );
    return rows.length > 0;
  }

  // Revoca las familias que el usuario tiene AHORA; las que empiecen después no se ven afectadas.
  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO revoked_refresh_families (family_id, expires_at)
       SELECT family_id, max(family_expires_at) FROM refresh_tokens WHERE user_id = $1
       GROUP BY family_id
       ON CONFLICT (family_id) DO NOTHING`,
      [userId]
    );
  }

  // Mantiene la tabla acotada con la hora del TokenService (no la de la base de datos).
  private async purgeExpired(now: Date): Promise<void> {
    await this.dataSource.query('DELETE FROM refresh_tokens WHERE family_expires_at < $1', [now]);
    await this.dataSource.query(
      'DELETE FROM revoked_refresh_families WHERE expires_at IS NOT NULL AND expires_at < $1',
      [now]
    );
  }
}
