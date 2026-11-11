import type { INestApplication } from '@nestjs/common';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { seedTokens, startApp, type StaffTokens } from '../support/http.js';

// Recorrido completo con SeaweedFS real: subir (sharp) → guardar en S3 → servir por la ruta pública.
// Sin claves de S3 en el entorno (un CI sin infraestructura) la suite no se ejecuta.
const { S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY } = process.env;
const enabled = Boolean(S3_ENDPOINT && S3_ACCESS_KEY && S3_SECRET_KEY);

interface World {
  app: INestApplication<App>;
  tokens: StaffTokens;
}

async function boot(): Promise<World> {
  process.env.MEDIA_STORAGE = 's3';
  process.env.S3_BUCKET = 'clic-moda-media-e2e';
  const app = await startApp();
  return { app, tokens: await seedTokens(app) };
}

async function uploadPhoto({ app, tokens }: World): Promise<string> {
  const photo = await sharp({
    create: { width: 2000, height: 1500, channels: 3, background: '#c7305a' },
  })
    .jpeg()
    .toBuffer();
  const res = await request(app.getHttpServer())
    .post('/media')
    .set('Authorization', `Bearer ${tokens.gerente}`)
    .field('alt', 'Bota Andes')
    .attach('file', photo, { filename: 'a.jpg', contentType: 'image/jpeg' })
    .expect(201);
  return res.body.id;
}

describe.skipIf(!enabled)('Imágenes sobre SeaweedFS (e2e)', () => {
  let world: World;

  beforeAll(async () => {
    world = await boot();
  });

  afterAll(async () => {
    await world.app.close();
    process.env.MEDIA_STORAGE = 'disk';
  });

  it('una foto subida se sirve desde SeaweedFS con sus medidas y caché', async () => {
    await world.app.get(DataSource).query('TRUNCATE "media_assets" CASCADE');
    const id = await uploadPhoto(world);

    const res = await request(world.app.getHttpServer())
      .get(`/public/media/${id}/story-1.jpg`)
      .expect(200);

    const meta = await sharp(res.body).metadata();
    expect([meta.width, meta.height, meta.format]).toEqual([1080, 1920, 'jpeg']);
    expect(res.headers['cache-control']).toContain('immutable');
  });
});
