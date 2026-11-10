import type { PasswordHasherPort } from '../application/ports/password-hasher.port.js';
import { PasswordHash } from '../domain/value-objects/password-hash.vo.js';

// Fake determinista: no es seguro, solo sirve para probar la aplicación sin el algoritmo real.
export class FakePasswordHasher implements PasswordHasherPort {
  readonly verifyCalls: string[] = [];

  async hash(plain: string): Promise<PasswordHash> {
    return PasswordHash.of(`fake:${plain}`);
  }

  async verify(plain: string, hash: PasswordHash): Promise<boolean> {
    this.verifyCalls.push(plain);
    return hash.value === `fake:${plain}`;
  }
}
