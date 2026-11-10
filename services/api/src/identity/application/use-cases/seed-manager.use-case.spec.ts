import { ConflictError } from '../../../shared/domain/errors/domain.error.js';
import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { FakePasswordHasher } from '../../testing/fake-password-hasher.js';
import { InMemoryUsersRepository } from '../../testing/in-memory-users.repository.js';
import { SeedManagerCommand } from '../dtos/seed-manager.dto.js';
import { SeedManagerUseCase } from './seed-manager.use-case.js';

const command = new SeedManagerCommand('gerente@tienda.com', 'clave-de-gerente-1', 'Gerente');

function setup() {
  const [users, hasher] = [new InMemoryUsersRepository(), new FakePasswordHasher()];
  return { users, hasher, useCase: new SeedManagerUseCase(users, hasher) };
}

describe('SeedManagerUseCase: primer arranque', () => {
  it('crea un Gerente con la contraseña hasheada y el correo verificado', async () => {
    const { users, useCase } = setup();
    const result = await useCase.execute(command);
    const manager = await users.findByEmail(Email.of('gerente@tienda.com'));

    expect(result).toEqual({ created: true, email: 'gerente@tienda.com' });
    expect([manager?.hasRole(Role.GERENTE), manager?.emailVerified]).toEqual([true, true]);
    expect(manager?.name.value).toBe('Gerente');
  });

  it('no guarda la contraseña en claro', async () => {
    const { users, useCase } = setup();
    await useCase.execute(command);
    const manager = await users.findByEmail(Email.of('gerente@tienda.com'));

    expect(manager?.passwordHash?.value).toBe('fake:clave-de-gerente-1');
  });
});

describe('SeedManagerUseCase: idempotencia', () => {
  it('una segunda ejecución no crea nada ni hashea otra contraseña', async () => {
    const { users, hasher, useCase } = setup();
    await useCase.execute(command);
    const again = await useCase.execute(command);

    expect(again).toEqual({ created: false, email: null });
    expect(await users.countWithRole(Role.GERENTE)).toBe(1);
    expect(hasher.hashCalls).toHaveLength(1);
  });

  it('si ya hay un Gerente con otro correo, no crea otro', async () => {
    const { users, useCase } = setup();
    const existing = User.create({
      email: Email.of('otro@tienda.com'),
      name: PersonName.of('Otro'),
    });
    existing.assignRoles([Role.GERENTE]);
    await users.save(existing);

    expect((await useCase.execute(command)).created).toBe(false);
    expect(await users.findByEmail(Email.of('gerente@tienda.com'))).toBeNull();
  });
});

describe('SeedManagerUseCase: conflicto', () => {
  it('si el correo ya pertenece a una cuenta sin rol de Gerente, falla con ConflictError', async () => {
    const { users, useCase } = setup();
    await users.save(
      User.create({ email: Email.of('gerente@tienda.com'), name: PersonName.of('Cliente') })
    );

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(ConflictError);
  });
});
