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
  // Las pruebas invocan el procesamiento de la cola de forma determinista, no con el temporizador.
  process.env.STOCK_QUEUE_WORKER = 'off';
  // Igual con el despachador de eventos: las pruebas lo invocan a mano (dispatchOnce).
  process.env.EVENT_DISPATCHER = 'off';
  // Las e2e de la API guardan imágenes en disco; el contrato de S3 usa SeaweedFS con su propio bucket.
  process.env.MEDIA_STORAGE = 'disk';
  process.env.MEDIA_DISK_DIR = '.media-test';
}
