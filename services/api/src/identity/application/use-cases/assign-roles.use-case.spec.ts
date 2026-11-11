import { NotFoundError, ValidationError } from '../../../shared/domain/errors/domain.error.js';
import { User } from '../../domain/entities/user.entity.js';
import { LastManagerError } from '../../domain/errors/last-manager.error.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { InMemoryRoleEventsRepository } from '../../testing/in-memory-role-events.repository.js';
import { InMemoryUsersRepository } from '../../testing/in-memory-users.repository.js';
import { AssignRolesCommand } from '../dtos/assign-roles.dto.js';
import { AssignRolesUseCase } from './assign-roles.use-case.js';

async function setup() {
  const users = new InMemoryUsersRepository();
  const events = new InMemoryRoleEventsRepository(users);
  const manager = User.create({ email: Email.of('jefe@tienda.com'), name: PersonName.of('Jefe') });
  manager.assignRoles([Role.GERENTE]);
  const ana = User.create({ email: Email.of('ana@tienda.com'), name: PersonName.of('Ana') });
  ana.assignRoles([Role.ATENCION]);
  await users.save(manager);
  await users.save(ana);
  return { users, events, manager, ana, useCase: new AssignRolesUseCase(users, events) };
}

const assign = (userId: string, roles: string[], operator = 'jhoel') =>
  new AssignRolesCommand(userId, roles, operator);

describe('AssignRolesUseCase: asignación', () => {
  it('asigna varios roles a la vez y reemplaza el conjunto anterior', async () => {
    const { useCase, users, ana } = await setup();
    const result = await useCase.execute(assign(ana.id.value, ['despacho', 'GERENTE']));

    expect(result).toMatchObject({
      previousRoles: ['ATENCION'],
      newRoles: ['GERENTE', 'DESPACHO'],
      changed: true,
    });
    expect((await users.findById(ana.id))?.roles.map((r) => r.value)).toEqual([
      'GERENTE',
      'DESPACHO',
    ]);
  });

  it('registra el cambio con el operador, los roles antes y después', async () => {
    const { useCase, events, ana } = await setup();
    await useCase.execute(assign(ana.id.value, ['DESPACHO'], 'operador-so'));
    const [event] = await events.listByUser(ana.id);

    expect(event.operator).toBe('operador-so');
    expect([event.previousRoles[0].value, event.newRoles[0].value]).toEqual([
      'ATENCION',
      'DESPACHO',
    ]);
  });
});

describe('AssignRolesUseCase: sin cambios', () => {
  it('si el usuario ya tiene exactamente esos roles, no cambia ni registra nada', async () => {
    const { useCase, events, ana } = await setup();
    const result = await useCase.execute(assign(ana.id.value, ['ATENCION']));

    expect(result.changed).toBe(false);
    expect(await events.listByUser(ana.id)).toHaveLength(0);
  });
});

describe('AssignRolesUseCase: protección del último Gerente', () => {
  it('rechaza quitarle el rol al único Gerente y no cambia nada ni registra', async () => {
    const { useCase, users, events, manager } = await setup();

    await expect(useCase.execute(assign(manager.id.value, ['DESPACHO']))).rejects.toBeInstanceOf(
      LastManagerError
    );
    expect((await users.findById(manager.id))?.hasRole(Role.GERENTE)).toBe(true);
    expect(await events.listByUser(manager.id)).toHaveLength(0);
  });

  it('permite quitárselo cuando hay otro Gerente', async () => {
    const { useCase, manager, ana } = await setup();
    await useCase.execute(assign(ana.id.value, ['GERENTE']));

    await expect(useCase.execute(assign(manager.id.value, ['DESPACHO']))).resolves.toMatchObject({
      changed: true,
    });
  });
});

describe('AssignRolesUseCase: entradas inválidas', () => {
  it('un usuario inexistente es NotFoundError', async () => {
    const { useCase } = await setup();

    await expect(
      useCase.execute(assign('11111111-1111-4111-8111-111111111111', ['GERENTE']))
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([
    ['rol desconocido', ['ADMIN']],
    ['identificador mal formado', 'no-uuid'],
  ])('%s es ValidationError', async (_caso, value) => {
    const { useCase, ana } = await setup();
    const command = Array.isArray(value) ? assign(ana.id.value, value) : assign(value, ['GERENTE']);

    await expect(useCase.execute(command)).rejects.toBeInstanceOf(ValidationError);
  });
});
