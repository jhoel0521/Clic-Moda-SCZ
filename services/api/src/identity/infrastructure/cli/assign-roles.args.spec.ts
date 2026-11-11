import { CliUsageError, parseAssignRolesArgs } from './assign-roles.args.js';

describe('parseAssignRolesArgs: válido', () => {
  it('sin argumentos es modo interactivo', () => {
    expect(parseAssignRolesArgs([])).toEqual({
      email: undefined,
      roles: undefined,
      yes: false,
      help: false,
    });
  });

  it('lee correo, lista de roles separada por comas y --yes', () => {
    expect(
      parseAssignRolesArgs(['--email', ' Ana@Tienda.com ', '--roles', 'GERENTE, DESPACHO', '--yes'])
    ).toEqual({ email: 'Ana@Tienda.com', roles: ['GERENTE', 'DESPACHO'], yes: true, help: false });
  });

  it('una lista vacía significa "sin roles"', () => {
    expect(parseAssignRolesArgs(['--email', 'a@b.com', '--roles', '']).roles).toEqual([]);
  });

  it('--help se reconoce', () => {
    expect(parseAssignRolesArgs(['--help']).help).toBe(true);
  });
});

describe('parseAssignRolesArgs: inválido', () => {
  it('--email sin --roles es un error de uso', () => {
    expect(() => parseAssignRolesArgs(['--email', 'a@b.com'])).toThrow(CliUsageError);
  });

  it('--roles sin --email es un error de uso', () => {
    expect(() => parseAssignRolesArgs(['--roles', 'GERENTE'])).toThrow(
      '--email y --roles se usan juntos'
    );
  });

  it('una opción desconocida es un error de uso, no una excepción cruda', () => {
    expect(() => parseAssignRolesArgs(['--nada'])).toThrow(CliUsageError);
  });

  it('los argumentos posicionales no se admiten', () => {
    expect(() => parseAssignRolesArgs(['ana@tienda.com'])).toThrow(CliUsageError);
  });
});
