import { existsSync } from 'node:fs';

export const TEST_DB_NAME = 'clic_moda_test';

// Las e2e SIEMPRE usan la base de pruebas, nunca la de desarrollo. Las variables ya definidas
// (p. ej. en CI) tienen prioridad sobre .env, salvo DB_NAME y NODE_ENV, que se fuerzan.
export function useTestDatabase(): void {
  if (existsSync('.env')) process.loadEnvFile('.env');
  process.env.DB_NAME = TEST_DB_NAME;
  process.env.NODE_ENV = 'test';
}
