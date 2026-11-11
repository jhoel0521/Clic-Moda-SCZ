import { User } from '../domain/entities/user.entity.js';
import { createRoleEvent } from '../domain/role-event.js';
import type { RoleEventsRepository } from '../domain/role-events.repository.port.js';
import type { UsersRepository } from '../domain/users.repository.port.js';
import { Email } from '../domain/value-objects/email.vo.js';
import { PersonName } from '../domain/value-objects/person-name.vo.js';
import { Role } from '../domain/value-objects/role.vo.js';
import { UserId } from '../domain/value-objects/user-id.vo.js';

export interface RoleEventsFixture {
  users: UsersRepository;
  events: RoleEventsRepository;
}

type Factory = () => Promise<RoleEventsFixture> | RoleEventsFixture;

async function savedUser(users: UsersRepository, roles: Role[]): Promise<User> {
  const user = User.create({ email: Email.of('ana@correo.com'), name: PersonName.of('Ana Pérez') });
  user.assignRoles(roles);
  await users.save(user);
  return user;
}

const eventFor = (user: User, previous: Role[], at: Date, operator = 'operador') =>
  createRoleEvent({ userId: user.id, previousRoles: previous, newRoles: user.roles, operator }, at);

function applyCases(make: Factory): void {
  it('applyChange guarda los nuevos roles del usuario y el evento', async () => {
    const { users, events } = await make();
    const ana = await savedUser(users, [Role.DESPACHO]);
    ana.assignRoles([Role.GERENTE, Role.ATENCION]);
    await events.applyChange(ana, eventFor(ana, [Role.DESPACHO], new Date()));

    const found = await users.findById(ana.id);
    expect(found?.roles.map((role) => role.value)).toEqual(['GERENTE', 'ATENCION']);
    expect(await events.listByUser(ana.id)).toHaveLength(1);
  });

  it('el evento conserva usuario, roles antes y después, instante y operador', async () => {
    const { users, events } = await make();
    const ana = await savedUser(users, [Role.DESPACHO]);
    const at = new Date('2026-11-10T12:00:00.000Z');
    ana.assignRoles([Role.GERENTE]);
    await events.applyChange(ana, eventFor(ana, [Role.DESPACHO], at, 'jhoel'));

    const [event] = await events.listByUser(ana.id);
    expect(event.operator).toBe('jhoel');
    expect(event.occurredAt.getTime()).toBe(at.getTime());
    expect([event.previousRoles.map((r) => r.value), event.newRoles.map((r) => r.value)]).toEqual([
      ['DESPACHO'],
      ['GERENTE'],
    ]);
  });
}

function atomicityCases(make: Factory): void {
  it('es atómico: si el evento no puede guardarse, el usuario NO cambia', async () => {
    const { users, events } = await make();
    const ana = await savedUser(users, [Role.DESPACHO]);
    ana.assignRoles([Role.GERENTE]);
    const orphan = createRoleEvent(
      { userId: UserId.generate(), previousRoles: [], newRoles: [], operator: 'x' },
      new Date()
    );

    await expect(events.applyChange(ana, orphan)).rejects.toThrow();
    expect((await users.findById(ana.id))?.roles.map((role) => role.value)).toEqual(['DESPACHO']);
  });
}

function listCases(make: Factory): void {
  it('listByUser devuelve primero el evento más reciente', async () => {
    const { users, events } = await make();
    const ana = await savedUser(users, [Role.DESPACHO]);
    ana.assignRoles([Role.GERENTE]);
    await events.applyChange(ana, eventFor(ana, [Role.DESPACHO], new Date('2026-01-01T00:00:00Z')));
    ana.assignRoles([Role.ATENCION]);
    await events.applyChange(ana, eventFor(ana, [Role.GERENTE], new Date('2026-02-01T00:00:00Z')));

    const listed = await events.listByUser(ana.id);
    expect(listed.map((event) => event.newRoles[0].value)).toEqual(['ATENCION', 'GERENTE']);
  });

  it('listByUser devuelve una lista vacía si el usuario no tiene eventos', async () => {
    const { events } = await make();

    expect(await events.listByUser(UserId.generate())).toEqual([]);
  });
}

// Prueba de contrato del puerto RoleEventsRepository. `make` debe devolver repositorios VACÍOS.
export function roleEventsRepositoryContract(label: string, make: Factory): void {
  describe(`RoleEventsRepository (${label})`, () => {
    applyCases(make);
    atomicityCases(make);
    listCases(make);
  });
}
