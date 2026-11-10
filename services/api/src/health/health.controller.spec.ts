import { Test } from '@nestjs/testing';
import { TerminusModule, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthController } from './health.controller.js';

const compile = (pingCheck: () => unknown) =>
  Test.createTestingModule({ imports: [TerminusModule], controllers: [HealthController] })
    .overrideProvider(TypeOrmHealthIndicator)
    .useValue({ pingCheck })
    .compile();

describe('HealthController', () => {
  it('informa ok cuando la base de datos responde', async () => {
    const moduleRef = await compile(() => ({ database: { status: 'up' } }));

    await expect(moduleRef.get(HealthController).check()).resolves.toMatchObject({
      status: 'ok',
      details: { database: { status: 'up' } },
    });
  });

  it('falla cuando la base de datos no responde', async () => {
    const moduleRef = await compile(() => {
      throw new Error('sin conexión');
    });

    await expect(moduleRef.get(HealthController).check()).rejects.toThrow();
  });
});
