import { SeedManagerCommand } from '../../application/dtos/seed-manager.dto.js';

const REQUIRED = ['INITIAL_MANAGER_EMAIL', 'INITIAL_MANAGER_PASSWORD'] as const;
const MIN_PASSWORD_LENGTH = 12;

export class SeedConfigError extends Error {}

// Lee la configuración del primer Gerente. Si falta algo, el error NOMBRA las variables y no se crea nada.
export function readSeedConfig(env: NodeJS.ProcessEnv): SeedManagerCommand {
  const missing = REQUIRED.filter((name) => !env[name]?.trim());
  if (missing.length > 0) {
    throw new SeedConfigError(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
  const password = env.INITIAL_MANAGER_PASSWORD as string;
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new SeedConfigError(
      `INITIAL_MANAGER_PASSWORD debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
    );
  }
  return new SeedManagerCommand(
    env.INITIAL_MANAGER_EMAIL as string,
    password,
    env.INITIAL_MANAGER_NAME?.trim() || 'Gerente'
  );
}
