import { existsSync } from 'node:fs';

export const TEST_DB_NAME = 'clic_moda_test';

// Las e2e SIEMPRE usan la base de pruebas, nunca la de desarrollo. Las variables ya definidas
// (p. ej. en CI) tienen prioridad sobre .env, salvo DB_NAME y NODE_ENV, que se fuerzan.
export function useTestDatabase(): void {
  if (existsSync('.env')) process.loadEnvFile('.env');
  process.env.DB_NAME = TEST_DB_NAME;
  process.env.NODE_ENV = 'test';
  // Solo para pruebas: clave fija no secreta y scrypt barato (las e2e hashean contraseñas).
  process.env.AUTH_JWT_KEY ??= 'clave-solo-para-pruebas-e2e-0123456789abcdef';
  process.env.AUTH_SCRYPT_LOG_N = '10';
}
