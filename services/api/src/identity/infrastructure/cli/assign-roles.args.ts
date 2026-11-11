import { parseArgs } from 'node:util';

export class CliUsageError extends Error {}

export interface AssignRolesOptions {
  email?: string;
  roles?: string[];
  yes: boolean;
  help: boolean;
}

export const USAGE = `Asignación de roles (uso excepcional, desde el servidor)

  Interactivo (necesita una terminal):
    node dist/identity/infrastructure/cli/assign-roles.js

  Con opciones (para scripts; sin terminal exige --yes):
    node dist/identity/infrastructure/cli/assign-roles.js --email ana@tienda.com --roles GERENTE,DESPACHO --yes

  Opciones:
    --email <correo>   Correo exacto del usuario
    --roles <lista>    Roles separados por comas: GERENTE, DESPACHO, ATENCION ("" quita todos)
    --yes              Confirma el cambio sin preguntar
    --help             Muestra esta ayuda`;

const OPTIONS = {
  email: { type: 'string' },
  roles: { type: 'string' },
  yes: { type: 'boolean', default: false },
  help: { type: 'boolean', default: false },
} as const;

function readValues(argv: string[]) {
  try {
    return parseArgs({ args: argv, options: OPTIONS, strict: true, allowPositionals: false })
      .values;
  } catch (error) {
    throw new CliUsageError(error instanceof Error ? error.message : String(error));
  }
}

// --email y --roles se usan siempre juntos. Una lista vacía ("") significa "sin roles".
export function parseAssignRolesArgs(argv: string[]): AssignRolesOptions {
  const values = readValues(argv);
  if ((values.email === undefined) !== (values.roles === undefined)) {
    throw new CliUsageError('--email y --roles se usan juntos');
  }
  return {
    email: values.email?.trim(),
    roles: values.roles
      ?.split(',')
      .map((role) => role.trim())
      .filter(Boolean),
    yes: values.yes ?? false,
    help: values.help ?? false,
  };
}
