import { PasswordHasher } from '@nestjs/authentication';
import { Injectable } from '@nestjs/common';
import type { PasswordHasherPort } from '../../application/ports/password-hasher.port.js';
import { PasswordHash } from '../../domain/value-objects/password-hash.vo.js';

// Adaptador: el hasher scrypt de @nestjs/authentication detrás de nuestro puerto. Si el paquete
// cambia (es 0.1.x), solo se toca este archivo.
@Injectable()
export class AuthenticationPasswordHasher implements PasswordHasherPort {
  constructor(private readonly hasher: PasswordHasher) {}

  async hash(plain: string): Promise<PasswordHash> {
    return PasswordHash.of(await this.hasher.hash(plain));
  }

  verify(plain: string, hash: PasswordHash): Promise<boolean> {
    return this.hasher.verify(plain, hash.value);
  }
}
