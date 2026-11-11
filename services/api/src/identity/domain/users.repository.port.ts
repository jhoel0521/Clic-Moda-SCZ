import type { User } from './entities/user.entity.js';
import type { Email } from './value-objects/email.vo.js';
import type { Role } from './value-objects/role.vo.js';
import type { UserId } from './value-objects/user-id.vo.js';

// Puerto de repositorio: pertenece al dominio; la implementación vive en infrastructure/persistence.
export interface UsersRepository {
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  // Busca por parte del nombre o del correo, sin distinguir mayúsculas.
  search(term: string, limit: number): Promise<User[]>;
  countWithRole(role: Role): Promise<number>;
  // Crea o actualiza (por id). Lanza ConflictError si el correo ya pertenece a otro usuario.
  save(user: User): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('UsersRepository');
