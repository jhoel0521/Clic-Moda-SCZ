import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { envSchema } from '../src/config/env.schema.js';

// forRoot valida las variables en el momento de llamarlo, por eso se invoca dentro de cada prueba.
const compileConfig = () =>
  Test.createTestingModule({
    imports: [ConfigModule.forRoot({ validationSchema: envSchema, ignoreEnvFile: true })],
  }).compile();

describe('Configuración (e2e)', () => {
  const original = process.env.PORT;

  afterEach(() => {
    if (original === undefined) delete process.env.PORT;
    else process.env.PORT = original;
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
});
