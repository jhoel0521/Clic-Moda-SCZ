import { User } from '../../domain/entities/user.entity.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { InMemoryUsersRepository } from '../../testing/in-memory-users.repository.js';
import { SearchUsersQuery } from '../dtos/assign-roles.dto.js';
import { SearchUsersUseCase } from './search-users.use-case.js';

async function setup() {
  const users = new InMemoryUsersRepository();
  for (const [email, name, roles] of [
    ['ana@tienda.com', 'Ana Pérez', [Role.GERENTE, Role.DESPACHO]],
    ['beto@correo.com', 'Beto Rojas', []],
  ] as const) {
    const user = User.create({ email: Email.of(email), name: PersonName.of(name) });
    user.assignRoles([...roles]);
    await users.save(user);
  }
  return new SearchUsersUseCase(users);
}

describe('SearchUsersUseCase', () => {
  it('encuentra por parte del nombre o del correo, sin distinguir mayúsculas', async () => {
    const useCase = await setup();

    expect((await useCase.execute(new SearchUsersQuery('PÉREZ', 10))).map((u) => u.email)).toEqual([
      'ana@tienda.com',
    ]);
    expect((await useCase.execute(new SearchUsersQuery('correo', 10))).map((u) => u.email)).toEqual(
      ['beto@correo.com']
    );
  });

  it('devuelve los roles de cada usuario como texto', async () => {
    const [ana] = await (await setup()).execute(new SearchUsersQuery('ana', 10));

    expect(ana.roles).toEqual(['GERENTE', 'DESPACHO']);
  });

  it('un término vacío o en blanco no devuelve nada', async () => {
    const useCase = await setup();

    expect(await useCase.execute(new SearchUsersQuery('   ', 10))).toEqual([]);
  });

  it('respeta el límite', async () => {
    const found = await (await setup()).execute(new SearchUsersQuery('@', 1));

    expect(found).toHaveLength(1);
  });
});
