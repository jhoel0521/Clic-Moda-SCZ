import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { envSchema } from '../src/config/env.schema.js';

// forRoot valida las variables en el momento de llamarlo, por eso se invoca dentro de cada prueba.
const compileConfig = () =>
  Test.createTestingModule({
    imports: [ConfigModule.forRoot({ validationSchema: envSchema, ignoreEnvFile: true })],
  }).compile();

const KEYS = ['PORT', 'DB_PASSWORD'] as const;

describe('Configuración (e2e)', () => {
  const saved = Object.fromEntries(KEYS.map((key) => [key, process.env[key]]));

  beforeEach(() => {
    process.env.DB_PASSWORD = 'secreto';
  });

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  });

  it('lee un PORT válido ya convertido a número', async () => {
    process.env.PORT = '4100';
    const moduleRef = await compileConfig();

    expect(moduleRef.get(ConfigService).get('PORT')).toBe(4100);
  });

  it('no arranca si PORT no es un puerto válido', async () => {
    process.env.PORT = 'abc';

    await expect(compileConfig()).rejects.toThrow();
  });

  it('no arranca si falta DB_PASSWORD', async () => {
    delete process.env.DB_PASSWORD;

    await expect(compileConfig()).rejects.toThrow();
  });
});
