import { checkbox, confirm, search } from '@inquirer/prompts';
import type { UserSummary } from '../../application/dtos/assign-roles.dto.js';
import { ROLE_VALUES } from '../../domain/value-objects/role.vo.js';
import type { RolesPrompter } from './assign-roles.flow.js';

const label = (user: UserSummary): string =>
  `${user.name} <${user.email}> [${user.roles.length > 0 ? user.roles.join(', ') : 'sin roles'}]`;

const rolesText = (roles: readonly string[]): string =>
  roles.length > 0 ? roles.join(', ') : 'sin roles';

// Pantalla interactiva real (Inquirer): búsqueda en vivo, confirmaciones y selección múltiple.
export class InquirerRolesPrompter implements RolesPrompter {
  pickUser(find: (term: string) => Promise<UserSummary[]>): Promise<UserSummary | null> {
    return search<UserSummary | null>({
      message: 'Busca un usuario (parte del nombre o del correo):',
      source: async (term) => {
        if (!term?.trim()) return [];
        return (await find(term)).map((user) => ({ name: label(user), value: user }));
      },
    });
  }

  confirmUser(user: UserSummary): Promise<boolean> {
    return confirm({ message: `¿Es ${label(user)} la persona correcta?`, default: false });
  }

  pickRoles(current: readonly string[]): Promise<string[]> {
    return checkbox({
      message: 'Roles (espacio marca o desmarca, enter confirma):',
      choices: ROLE_VALUES.map((value) => ({
        name: value,
        value,
        checked: current.includes(value),
      })),
    });
  }

  confirmChange(
    user: UserSummary,
    before: readonly string[],
    after: readonly string[]
  ): Promise<boolean> {
    return confirm({
      message: `Cambiar los roles de ${user.email}: ${rolesText(before)} → ${rolesText(after)}. ¿Confirmas?`,
      default: false,
    });
  }
}
