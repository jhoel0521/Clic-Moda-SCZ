import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { envSchema } from '../src/shared/infrastructure/config/env.schema.js';

// forRoot valida las variables en el momento de llamarlo, por eso se invoca dentro de cada prueba.
const compileConfig = () =>
  Test.createTestingModule({
    imports: [ConfigModule.forRoot({ validationSchema: envSchema, ignoreEnvFile: true })],
  }).compile();

const KEYS = ['PORT', 'DB_PASSWORD', 'AUTH_JWT_KEY'] as const;

// Guarda las variables que toca la prueba y devuelve la función que las restaura.
function snapshotEnv(): () => void {
  const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));
  return () => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  };
}

// Cada prueba parte de un entorno válido y lo deja como estaba.
function useValidEnv(): void {
  let restoreEnv: () => void;

  beforeEach(() => {
    restoreEnv = snapshotEnv();
    process.env.DB_PASSWORD = 'secreto';
    process.env.AUTH_JWT_KEY = 'k'.repeat(32);
  });

  afterEach(() => restoreEnv());
}

describe('Configuración (e2e): valores', () => {
  useValidEnv();

  it('lee un PORT válido ya convertido a número', async () => {
    process.env.PORT = '4100';
    const moduleRef = await compileConfig();

    expect(moduleRef.get(ConfigService).get('PORT')).toBe(4100);
  });

  it('no arranca si PORT no es un puerto válido', async () => {
    process.env.PORT = 'abc';

    await expect(compileConfig()).rejects.toThrow();
  });
});

describe('Configuración (e2e): variables obligatorias', () => {
  useValidEnv();

  it('no arranca si falta DB_PASSWORD', async () => {
    delete process.env.DB_PASSWORD;

    await expect(compileConfig()).rejects.toThrow();
  });

  it('no arranca si falta AUTH_JWT_KEY', async () => {
    delete process.env.AUTH_JWT_KEY;

    await expect(compileConfig()).rejects.toThrow();
  });
});
