import { Test } from '@nestjs/testing';
import { HealthController } from './health.controller.js';
import { HealthModule } from './health.module.js';

describe('HealthController', () => {
  it('informa estado ok cuando no hay indicadores que fallen', async () => {
    const module = await Test.createTestingModule({ imports: [HealthModule] }).compile();
    const controller = module.get(HealthController);

    await expect(controller.check()).resolves.toMatchObject({ status: 'ok' });
  });
});
