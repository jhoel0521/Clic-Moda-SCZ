import type { UseCase } from '../../../shared/application/use-case.js';
import { DomainError } from '../../../shared/domain/errors/domain.error.js';
import {
  type AssignRolesCommand,
  type AssignRolesResult,
  SearchUsersQuery,
  type UserSummary,
} from '../../application/dtos/assign-roles.dto.js';
import type { AssignRolesOptions } from './assign-roles.args.js';

// Interfaz de la "pantalla": la implementa Inquirer en producción y un fake en las pruebas.
export interface RolesPrompter {
  pickUser(find: (term: string) => Promise<UserSummary[]>): Promise<UserSummary | null>;
  confirmUser(user: UserSummary): Promise<boolean>;
  pickRoles(current: readonly string[]): Promise<string[]>;
  confirmChange(
    user: UserSummary,
    before: readonly string[],
    after: readonly string[]
  ): Promise<boolean>;
}

export interface FlowDeps {
  search: UseCase<SearchUsersQuery, UserSummary[]>;
  assign: UseCase<AssignRolesCommand, AssignRolesResult>;
  prompter: RolesPrompter | null; // null = sin terminal interactiva
  operator: string;
  makeCommand: (userId: string, roles: string[], operator: string) => AssignRolesCommand;
}

export interface FlowOutcome {
  code: 0 | 1;
  message: string;
}

const NOTHING = 'No se cambió nada.';
const list = (roles: readonly string[]): string =>
  roles.length > 0 ? roles.join(', ') : 'sin roles';

async function apply(user: UserSummary, roles: string[], deps: FlowDeps): Promise<FlowOutcome> {
  try {
    const result = await deps.assign.execute(deps.makeCommand(user.id, roles, deps.operator));
    return {
      code: 0,
      message: result.changed
        ? `Listo: ${user.email} ahora tiene ${list(result.newRoles)} (antes: ${list(result.previousRoles)}).`
        : `${user.email} ya tenía exactamente esos roles. ${NOTHING}`,
    };
  } catch (error) {
    if (error instanceof DomainError) return { code: 1, message: `${error.message}. ${NOTHING}` };
    throw error;
  }
}

async function byOptions(options: AssignRolesOptions, deps: FlowDeps): Promise<FlowOutcome> {
  const found = await deps.search.execute(new SearchUsersQuery(options.email as string, 5));
  const user = found.find((candidate) => candidate.email === options.email?.toLowerCase());
  if (!user)
    return { code: 1, message: `No existe un usuario con el correo ${options.email}. ${NOTHING}` };
  const roles = options.roles ?? [];
  if (!options.yes) {
    if (!deps.prompter)
      return {
        code: 1,
        message: `Sin terminal interactiva hace falta --yes para confirmar. ${NOTHING}`,
      };
    if (!(await deps.prompter.confirmChange(user, user.roles, roles)))
      return { code: 0, message: NOTHING };
  }
  return apply(user, roles, deps);
}

async function interactive(prompter: RolesPrompter, deps: FlowDeps): Promise<FlowOutcome> {
  const user = await prompter.pickUser((term) =>
    deps.search.execute(new SearchUsersQuery(term, 10))
  );
  if (!user) return { code: 0, message: `No se seleccionó ningún usuario. ${NOTHING}` };
  if (!(await prompter.confirmUser(user))) return { code: 0, message: NOTHING };
  const roles = await prompter.pickRoles(user.roles);
  if (!(await prompter.confirmChange(user, user.roles, roles)))
    return { code: 0, message: NOTHING };
  return apply(user, roles, deps);
}

export async function runAssignRoles(
  options: AssignRolesOptions,
  deps: FlowDeps
): Promise<FlowOutcome> {
  if (options.email !== undefined) return byOptions(options, deps);
  if (!deps.prompter) {
    return {
      code: 1,
      message:
        'Sin terminal interactiva hay que pasar --email, --roles y --yes (ver --help). No se cambió nada.',
    };
  }
  return interactive(deps.prompter, deps);
}
