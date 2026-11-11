import { userInfo } from 'node:os';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module.js';
import { AssignRolesCommand } from '../../application/dtos/assign-roles.dto.js';
import { AssignRolesUseCase } from '../../application/use-cases/assign-roles.use-case.js';
import { SearchUsersUseCase } from '../../application/use-cases/search-users.use-case.js';
import {
  type AssignRolesOptions,
  CliUsageError,
  parseAssignRolesArgs,
  USAGE,
} from './assign-roles.args.js';
import { runAssignRoles } from './assign-roles.flow.js';
import { InquirerRolesPrompter } from './assign-roles.prompter.js';

// Adaptador de entrada (CLI) de AssignRolesUseCase. Se ejecuta compilado, sin gestor de paquetes:
//   node dist/identity/infrastructure/cli/assign-roles.js [--email ... --roles ... --yes]

// Falla antes de arrancar la aplicación si no hay forma de obtener la confirmación.
function requireTerminalOrOptions(options: AssignRolesOptions, hasTerminal: boolean): void {
  if (!hasTerminal && options.email === undefined) {
    throw new CliUsageError(
      'Sin terminal interactiva hay que pasar --email, --roles y --yes (ver --help)'
    );
  }
}

async function execute(options: AssignRolesOptions, hasTerminal: boolean): Promise<number> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const outcome = await runAssignRoles(options, {
      search: app.get(SearchUsersUseCase),
      assign: app.get(AssignRolesUseCase),
      prompter: hasTerminal ? new InquirerRolesPrompter() : null,
      operator: userInfo().username,
      makeCommand: (userId, roles, operator) => new AssignRolesCommand(userId, roles, operator),
    });
    console.log(outcome.message);
    return outcome.code;
  } finally {
    await app.close();
  }
}

async function main(): Promise<number> {
  const options = parseAssignRolesArgs(process.argv.slice(2));
  if (options.help) {
    console.log(USAGE);
    return 0;
  }
  const hasTerminal = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  requireTerminalOrOptions(options, hasTerminal);
  return execute(options, hasTerminal);
}

function describeFailure(error: unknown): unknown {
  if (error instanceof Error && error.name === 'ExitPromptError') {
    return 'Cancelado. No se cambió nada.';
  }
  return error instanceof CliUsageError ? `${error.message}\n\n${USAGE}` : error;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(describeFailure(error));
    process.exitCode = 1;
  });
