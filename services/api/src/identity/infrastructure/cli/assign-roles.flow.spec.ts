import { User } from '../../domain/entities/user.entity.js';
import { AssignRolesCommand, type UserSummary } from '../../application/dtos/assign-roles.dto.js';
import { AssignRolesUseCase } from '../../application/use-cases/assign-roles.use-case.js';
import { SearchUsersUseCase } from '../../application/use-cases/search-users.use-case.js';
import { Email } from '../../domain/value-objects/email.vo.js';
import { PersonName } from '../../domain/value-objects/person-name.vo.js';
import { Role } from '../../domain/value-objects/role.vo.js';
import { InMemoryRoleEventsRepository } from '../../testing/in-memory-role-events.repository.js';
import { InMemoryUsersRepository } from '../../testing/in-memory-users.repository.js';
import type { AssignRolesOptions } from './assign-roles.args.js';
import { type FlowDeps, runAssignRoles, type RolesPrompter } from './assign-roles.flow.js';

// "Pantalla" de mentira: responde lo que se le programe y anota qué se le preguntó.
class ScriptedPrompter implements RolesPrompter {
  asked: string[] = [];
  constructor(
    private readonly script: {
      user?: 'ana' | null;
      userOk?: boolean;
      roles?: string[];
      changeOk?: boolean;
    }
  ) {}

  async pickUser(find: (term: string) => Promise<UserSummary[]>) {
    this.asked.push('pickUser');
    return this.script.user === null ? null : ((await find('ana'))[0] ?? null);
  }
  async confirmUser() {
    this.asked.push('confirmUser');
    return this.script.userOk ?? true;
  }
  async pickRoles() {
    this.asked.push('pickRoles');
    return this.script.roles ?? ['DESPACHO'];
  }
  async confirmChange() {
    this.asked.push('confirmChange');
    return this.script.changeOk ?? true;
  }
}

async function setup(prompter: RolesPrompter | null) {
  const users = new InMemoryUsersRepository();
  const events = new InMemoryRoleEventsRepository(users);
  const jefe = User.create({ email: Email.of('jefe@tienda.com'), name: PersonName.of('Jefe') });
  jefe.assignRoles([Role.GERENTE]);
  const ana = User.create({ email: Email.of('ana@tienda.com'), name: PersonName.of('Ana') });
  ana.assignRoles([Role.ATENCION]);
  await users.save(jefe);
  await users.save(ana);
  const deps: FlowDeps = {
    search: new SearchUsersUseCase(users),
    assign: new AssignRolesUseCase(users, events),
    prompter,
    operator: 'operador-so',
    makeCommand: (id, roles, operator) => new AssignRolesCommand(id, roles, operator),
  };
  return { deps, users, events, ana, jefe };
}

const interactiveMode: AssignRolesOptions = { yes: false, help: false };
const rolesOf = async (users: InMemoryUsersRepository, user: User) =>
  (await users.findById(user.id))?.roles.map((role) => role.value);

describe('Flujo interactivo', () => {
  it('buscar, confirmar la persona, elegir roles y confirmar el cambio lo aplica', async () => {
    const prompter = new ScriptedPrompter({ roles: ['DESPACHO', 'ATENCION'] });
    const { deps, users, ana } = await setup(prompter);
    const outcome = await runAssignRoles(interactiveMode, deps);

    expect(outcome.code).toBe(0);
    expect(await rolesOf(users, ana)).toEqual(['DESPACHO', 'ATENCION']);
    expect(prompter.asked).toEqual(['pickUser', 'confirmUser', 'pickRoles', 'confirmChange']);
  });

  it('si no se confirma la persona, no se cambia nada y no se piden roles', async () => {
    const prompter = new ScriptedPrompter({ userOk: false });
    const { deps, users, ana } = await setup(prompter);
    const outcome = await runAssignRoles(interactiveMode, deps);

    expect(outcome).toMatchObject({ code: 0, message: 'No se cambió nada.' });
    expect([await rolesOf(users, ana), prompter.asked.includes('pickRoles')]).toEqual([
      ['ATENCION'],
      false,
    ]);
  });
});

describe('Flujo interactivo: cancelaciones y fallos', () => {
  it('si no se confirma el cambio final, no se cambia nada ni se registra', async () => {
    const { deps, users, events, ana } = await setup(new ScriptedPrompter({ changeOk: false }));
    await runAssignRoles(interactiveMode, deps);

    expect(await rolesOf(users, ana)).toEqual(['ATENCION']);
    expect(await events.listByUser(ana.id)).toHaveLength(0);
  });

  it('si no se elige a nadie, termina sin cambios', async () => {
    const { deps } = await setup(new ScriptedPrompter({ user: null }));

    expect(await runAssignRoles(interactiveMode, deps)).toMatchObject({ code: 0 });
  });

  it('quitar el rol al único Gerente se rechaza con un mensaje que explica el motivo', async () => {
    const { deps, users, jefe } = await setup(new ScriptedPrompter({}));
    const outcome = await runAssignRoles(
      { yes: true, help: false, email: 'jefe@tienda.com', roles: [] },
      deps
    );

    expect(outcome.code).toBe(1);
    expect(outcome.message).toMatch(/último Gerente/);
    expect(await rolesOf(users, jefe)).toEqual(['GERENTE']);
  });
});

const withOptions = (overrides: Partial<AssignRolesOptions>): AssignRolesOptions => ({
  email: 'ana@tienda.com',
  roles: ['GERENTE', 'DESPACHO'],
  yes: true,
  help: false,
  ...overrides,
});

describe('Flujo con opciones: aplica', () => {
  it('con --yes aplica el cambio SIN preguntar nada', async () => {
    const prompter = new ScriptedPrompter({});
    const { deps, users, ana } = await setup(prompter);
    await runAssignRoles(withOptions({}), deps);

    expect(await rolesOf(users, ana)).toEqual(['GERENTE', 'DESPACHO']);
    expect(prompter.asked).toEqual([]);
  });

  it('el operador queda registrado en el evento', async () => {
    const { deps, events, ana } = await setup(null);
    await runAssignRoles(withOptions({}), deps);

    expect((await events.listByUser(ana.id))[0].operator).toBe('operador-so');
  });
});

describe('Flujo con opciones: fallos', () => {
  it('sin terminal y sin --yes falla y no cambia nada', async () => {
    const { deps, users, ana } = await setup(null);
    const outcome = await runAssignRoles(withOptions({ yes: false }), deps);

    expect(outcome.code).toBe(1);
    expect(await rolesOf(users, ana)).toEqual(['ATENCION']);
  });

  it('un correo que no existe falla con un mensaje claro', async () => {
    const { deps } = await setup(null);

    expect(await runAssignRoles(withOptions({ email: 'nadie@tienda.com' }), deps)).toMatchObject({
      code: 1,
    });
  });

  it('sin terminal y sin opciones explica cómo usarlo', async () => {
    const { deps } = await setup(null);
    const outcome = await runAssignRoles(interactiveMode, deps);

    expect([outcome.code, outcome.message]).toEqual([
      1,
      expect.stringContaining('--email, --roles y --yes'),
    ]);
  });
});
