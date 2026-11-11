import { NestFactory } from '@nestjs/core';
import { parseArgs } from 'node:util';
import { AppModule } from '../../../app.module.js';
import {
  ResetPasswordCommand,
  ResetPasswordUseCase,
} from '../../application/use-cases/reset-password.use-case.js';

// Adaptador de entrada (CLI) de ResetPasswordUseCase. Se ejecuta compilado, sin gestor de paquetes:
//   node dist/identity/infrastructure/cli/reset-password.js --email ana@tienda.com --password "..."
// También acepta RESET_EMAIL y RESET_PASSWORD para no dejar la contraseña en el historial del shell.
function readCommand(): ResetPasswordCommand {
  const { values } = parseArgs({
    options: { email: { type: 'string' }, password: { type: 'string' } },
  });
  const email = values.email ?? process.env.RESET_EMAIL;
  const password = values.password ?? process.env.RESET_PASSWORD;
  if (!email || !password) {
    throw new Error('Uso: --email <correo> --password <nueva contraseña, mínimo 12 caracteres>');
  }
  return new ResetPasswordCommand(email, password);
}

async function main(): Promise<void> {
  const command = readCommand();
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const result = await app.get(ResetPasswordUseCase).execute(command);
    console.log(`Contraseña actualizada para ${result.email}`);
  } finally {
    await app.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
