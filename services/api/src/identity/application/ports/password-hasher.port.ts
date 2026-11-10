import type { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';

// Puerto de servicio externo: pertenece a la aplicación; la implementación vive en infrastructure.
export interface PasswordHasherPort {
  hash(plain: string): Promise<PasswordHash>;
  verify(plain: string, hash: PasswordHash): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PasswordHasher');
