// Importante: @inquirer/testing/vitest debe importarse ANTES que el código que usa Inquirer.
import { screen } from '@inquirer/testing/vitest';
import type { UserSummary } from '../../application/dtos/assign-roles.dto.js';
import { InquirerRolesPrompter } from './assign-roles.prompter.js';

const ana: UserSummary = {
  id: 'u-1',
  email: 'ana@tienda.com',
  name: 'Ana Pérez',
  roles: ['ATENCION'],
};

describe('InquirerRolesPrompter: búsqueda de usuario (prompt real)', () => {
  it('escribe un término, lista las coincidencias y selecciona con enter', async () => {
    const find = vi.fn(async () => [ana]);
    const picked = new InquirerRolesPrompter().pickUser(find);

    expect(screen.getScreen()).toContain('Busca un usuario');
    screen.type('ana');
    await screen.next();
    expect(screen.getScreen()).toContain('Ana Pérez <ana@tienda.com> [ATENCION]');
    screen.keypress('enter');

    await expect(picked).resolves.toEqual(ana);
    expect(find).toHaveBeenCalledWith('ana');
  });
});

describe('InquirerRolesPrompter: confirmaciones (prompt real)', () => {
  it('por defecto NO confirma: pulsar enter sin escribir es "no"', async () => {
    const answer = new InquirerRolesPrompter().confirmUser(ana);

    expect(screen.getScreen()).toContain('¿Es Ana Pérez <ana@tienda.com>');
    screen.keypress('enter');

    await expect(answer).resolves.toBe(false);
  });

  it('escribir "y" y enter confirma el cambio, y el mensaje muestra antes y después', async () => {
    const answer = new InquirerRolesPrompter().confirmChange(ana, ['ATENCION'], ['GERENTE']);

    expect(screen.getScreen()).toContain('ATENCION → GERENTE');
    screen.type('y');
    screen.keypress('enter');

    await expect(answer).resolves.toBe(true);
  });
});

describe('InquirerRolesPrompter: selección múltiple de roles (prompt real)', () => {
  it('muestra marcados los roles actuales y permite marcar otros con espacio', async () => {
    const answer = new InquirerRolesPrompter().pickRoles(['ATENCION']);

    expect(screen.getScreen()).toMatch(/GERENTE/);
    expect(screen.getScreen()).toMatch(/ATENCION/);
    screen.keypress('space'); // marca GERENTE (la primera opción)
    screen.keypress('enter');

    await expect(answer).resolves.toEqual(['GERENTE', 'ATENCION']);
  });

  it('permite desmarcar todos los roles', async () => {
    const answer = new InquirerRolesPrompter().pickRoles(['GERENTE']);
    screen.keypress('space'); // desmarca GERENTE
    screen.keypress('enter');

    await expect(answer).resolves.toEqual([]);
  });
});
