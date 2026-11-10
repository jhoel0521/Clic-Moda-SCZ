import { ConflictError } from '../../shared/domain/errors/domain.error.js';
import { User } from '../domain/entities/user.entity.js';
import type { UsersRepository } from '../domain/users.repository.port.js';
import { Email } from '../domain/value-objects/email.vo.js';
import { PersonName } from '../domain/value-objects/person-name.vo.js';
import { Role } from '../domain/value-objects/role.vo.js';
import { UserId } from '../domain/value-objects/user-id.vo.js';

type Factory = () => Promise<UsersRepository> | UsersRepository;

const person = (email: string, name: string): User =>
  User.create({ email: Email.of(email), name: PersonName.of(name) });

function lookupCases(make: Factory): void {
  it('findById devuelve null si el usuario no existe', async () => {
    const repo = await make();

    expect(await repo.findById(UserId.generate())).toBeNull();
  });

  it('guarda un usuario y lo recupera con todos sus datos', async () => {
    const [repo, ana] = [await make(), person('ana@correo.com', 'Ana Pérez')];
    await repo.save(ana);

    const found = await repo.findById(ana.id);
    expect([found?.email.value, found?.name.value]).toEqual(['ana@correo.com', 'Ana Pérez']);
  });

  it('findByEmail no distingue mayúsculas', async () => {
    const [repo, ana] = [await make(), person('ana@correo.com', 'Ana Pérez')];
    await repo.save(ana);

    expect((await repo.findByEmail(Email.of('ANA@Correo.com')))?.id.equals(ana.id)).toBe(true);
  });
}

function roleCases(make: Factory): void {
  it('guarda un usuario con dos roles y los recupera', async () => {
    const [repo, ana] = [await make(), person('ana@correo.com', 'Ana Pérez')];
    ana.assignRoles([Role.DESPACHO, Role.ATENCION]);
    await repo.save(ana);

    const found = await repo.findById(ana.id);
    expect(found?.roles.map((role) => role.value).sort()).toEqual(['ATENCION', 'DESPACHO']);
  });

  it('save actualiza por id y reemplaza el conjunto de roles', async () => {
    const [repo, ana] = [await make(), person('ana@correo.com', 'Ana Pérez')];
    ana.assignRoles([Role.GERENTE, Role.DESPACHO]);
    await repo.save(ana);
    ana.assignRoles([Role.ATENCION]);
    await repo.save(ana);

    const found = await repo.findById(ana.id);
    expect(found?.roles.map((role) => role.value)).toEqual(['ATENCION']);
  });
}

function uniquenessCases(make: Factory): void {
  it('rechaza con ConflictError un correo que ya es de otro usuario', async () => {
    const [repo, ana] = [await make(), person('ana@correo.com', 'Ana Pérez')];
    await repo.save(ana);

    await expect(repo.save(person('ANA@correo.com', 'Otra Ana'))).rejects.toBeInstanceOf(
      ConflictError
    );
  });

  it('permite guardar de nuevo al mismo usuario con su mismo correo', async () => {
    const [repo, ana] = [await make(), person('ana@correo.com', 'Ana Pérez')];
    await repo.save(ana);

    await expect(repo.save(ana)).resolves.toBeUndefined();
  });
}

function searchCases(make: Factory): void {
  it('search encuentra por parte del nombre o del correo sin distinguir mayúsculas', async () => {
    const repo = await make();
    await repo.save(person('ana@correo.com', 'Ana Pérez'));
    await repo.save(person('beto@tienda.com', 'Beto Rojas'));

    expect((await repo.search('PÉREZ', 10)).map((user) => user.email.value)).toEqual([
      'ana@correo.com',
    ]);
    expect((await repo.search('tienda', 10)).map((user) => user.email.value)).toEqual([
      'beto@tienda.com',
    ]);
  });

  it('search respeta el límite y ordena por nombre', async () => {
    const repo = await make();
    await repo.save(person('b@x.com', 'Beto'));
    await repo.save(person('a@x.com', 'Ana'));

    expect((await repo.search('x.com', 1)).map((user) => user.name.value)).toEqual(['Ana']);
  });

  it('search trata % y _ como texto literal', async () => {
    const repo = await make();
    await repo.save(person('ana@correo.com', 'Ana Pérez'));

    expect(await repo.search('%', 10)).toHaveLength(0);
  });
}

function countCases(make: Factory): void {
  it('countWithRole cuenta los usuarios que tienen ese rol', async () => {
    const [repo, ana, beto] = [await make(), person('a@x.com', 'Ana'), person('b@x.com', 'Beto')];
    ana.assignRoles([Role.GERENTE, Role.DESPACHO]);
    beto.assignRoles([Role.DESPACHO]);
    await repo.save(ana);
    await repo.save(beto);

    expect([
      await repo.countWithRole(Role.GERENTE),
      await repo.countWithRole(Role.DESPACHO),
    ]).toEqual([1, 2]);
  });
}

// Prueba de contrato del puerto UsersRepository: la misma suite se ejecuta contra el fake en memoria
// y contra la implementación real, de modo que el fake no puede divergir. `make` debe devolver un
// repositorio VACÍO en cada llamada.
export function usersRepositoryContract(label: string, make: Factory): void {
  describe(`UsersRepository (${label})`, () => {
    lookupCases(make);
    roleCases(make);
    uniquenessCases(make);
    searchCases(make);
    countCases(make);
  });
}
