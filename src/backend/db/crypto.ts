import crypto from 'crypto';

/**
 * Genera un hash PBKDF2 para una contraseña plana.
 * Formato: "salt:hash"
 */
export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifica si una contraseña plana coincide con el hash almacenado.
 */
export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const verifyHash = crypto.pbkdf2Sync(plain, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}
