import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../../app.module.js';
import { SeedManagerUseCase } from '../../application/use-cases/seed-manager.use-case.js';
import { readSeedConfig, SeedConfigError } from './seed-manager.config.js';

// Adaptador de entrada (CLI) de SeedManagerUseCase. Se ejecuta compilado, sin gestor de paquetes:
//   node dist/identity/infrastructure/cli/seed-manager.js
async function main(): Promise<number> {
  const command = readSeedConfig(process.env);
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error'] });
  try {
    const result = await app.get(SeedManagerUseCase).execute(command);
    console.log(
      result.created
        ? `Gerente creado: ${result.email}`
        : 'Ya existe un Gerente: no se hizo ningún cambio.'
    );
    return 0;
  } finally {
    await app.close();
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof SeedConfigError ? error.message : error);
    process.exitCode = 1;
  });
