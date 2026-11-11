import { ConflictError } from '../../shared/domain/errors/domain.error.js';
import { User } from '../domain/entities/user.entity.js';
import type { UsersRepository } from '../domain/users.repository.port.js';
import type { Email } from '../domain/value-objects/email.vo.js';
import type { Role } from '../domain/value-objects/role.vo.js';
import type { UserId } from '../domain/value-objects/user-id.vo.js';

// Fake en memoria del puerto: lo usan las pruebas de aplicación. La prueba de contrato garantiza
// que se comporta igual que la implementación real con Postgres.
export class InMemoryUsersRepository implements UsersRepository {
  private readonly store = new Map<string, User>();

  async findById(id: UserId): Promise<User | null> {
    return this.copy(this.store.get(id.value));
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.copy(this.all().find((user) => user.email.equals(email)));
  }

  async search(term: string, limit: number): Promise<User[]> {
    const needle = term.trim().toLowerCase();
    return this.all()
      .filter((user) => `${user.name.value} ${user.email.value}`.toLowerCase().includes(needle))
      .sort((a, b) => a.name.value.localeCompare(b.name.value))
      .slice(0, limit)
      .map((user) => this.copy(user) as User);
  }

  async countWithRole(role: Role): Promise<number> {
    return this.all().filter((user) => user.hasRole(role)).length;
  }

  async save(user: User): Promise<void> {
    const clash = this.all().find((own) => own.email.equals(user.email) && !own.id.equals(user.id));
    if (clash) throw new ConflictError(`El correo ${user.email.value} ya está registrado`);
    this.store.set(user.id.value, this.copy(user) as User);
  }

  private all(): User[] {
    return [...this.store.values()];
  }

  // Copia defensiva: lo guardado no se altera si el llamador modifica su instancia.
  private copy(user: User | undefined): User | null {
    return user
      ? User.rehydrate({
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          passwordHash: user.passwordHash,
          roles: user.roles,
        })
      : null;
  }
}
