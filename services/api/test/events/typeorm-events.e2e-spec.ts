import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { EVENT_DELIVERIES } from '../../src/shared/application/events/event-deliveries.port.js';
import { EventOutbox } from '../../src/shared/infrastructure/events/event-outbox.js';
import { eventDeliveriesContract } from '../../src/shared/testing/event-deliveries.contract.js';
import { truncateAll } from '../support/db.js';

describe('Eventos sobre Postgres (e2e)', () => {
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  });

  afterAll(async () => {
    await moduleRef.close();
  });

  // La MISMA suite de contrato que corre contra el fake en memoria, ahora contra Postgres real.
  eventDeliveriesContract('TypeORM + Postgres', async () => {
    const db = moduleRef.get(DataSource);
    await truncateAll(db);
    const outbox = moduleRef.get(EventOutbox);
    return {
      deliveries: moduleRef.get(EVENT_DELIVERIES),
      publish: (event) => db.transaction((manager) => outbox.publish(manager, event)),
    };
  });
});
