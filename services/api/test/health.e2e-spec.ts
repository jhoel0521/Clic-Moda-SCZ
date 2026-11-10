import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module.js';
import { setupDocs } from '../src/docs.setup.js';

describe('Salud y documentación (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    setupDocs(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /health comprueba la base de datos y responde ok', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.details.database.status).toBe('up');
  });

  it('las e2e se conectan a la base de pruebas, no a la de desarrollo', async () => {
    const [row] = await app.get(DataSource).query('select current_database() as db');
    expect(row.db).toBe('clic_moda_test');
  });

  it('GET /docs/json documenta la ruta /health', async () => {
    const res = await request(app.getHttpServer()).get('/docs/json').expect(200);
    expect(Object.keys(res.body.paths)).toContain('/health');
  });
});
