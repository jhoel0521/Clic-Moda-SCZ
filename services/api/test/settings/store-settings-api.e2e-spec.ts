import type { INestApplication } from '@nestjs/common';
import { rm } from 'node:fs/promises';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { call, seedTokens, startApp, type StaffTokens } from '../support/http.js';

let app: INestApplication<App>;
let tokens: StaffTokens;

beforeAll(async () => {
  app = await startApp();
  tokens = await seedTokens(app);
});

afterAll(async () => {
  await app.close();
  await rm('.media-test', { recursive: true, force: true });
});

beforeEach(async () => {
  await app.get(DataSource).query('TRUNCATE "store_settings", "media_assets" CASCADE');
});

const body = (over: Record<string, unknown> = {}) => ({
  brandName: 'Verashoe',
  tagline: 'Calzado de moda',
  brandColor: '#c7305a',
  logoMediaId: null,
  seoTitle: 'Verashoe · Calzado de moda en Santa Cruz',
  seoDescription:
    'Zapatos de moda en Santa Cruz. Mira el catálogo, elige tu talla y cierra tu compra por WhatsApp con nosotros.',
  shareMediaId: null,
  whatsapp: '59171234567',
  address: 'Av. Banzer 123',
  pickupHours: 'Lunes a sábado de 9 a 18',
  mapUrl: null,
  instagram: 'https://www.instagram.com/verashoe',
  tiktok: null,
  facebook: null,
  ...over,
});

const put = (token: string | undefined, data: object) =>
  call(app, 'put', '/store-settings', token, data);

describe('Configuración: lectura anónima', () => {
  it('sin guardar nada entrega la semilla, con caché de 15 s y ETag', async () => {
    const res = await request(app.getHttpServer()).get('/store-settings').expect(200);

    expect(res.body.brandName).toBe('Clic Moda SC');
    expect(res.headers['cache-control']).toBe('public, max-age=15');
    expect(res.headers.etag).toMatch(/^"[0-9a-f]{40}"$/);
  });

  it('no expone datos de pago ni nada privado', async () => {
    const res = await request(app.getHttpServer()).get('/store-settings').expect(200);

    expect(JSON.stringify(res.body).toLowerCase()).not.toMatch(/banco|bank|cuenta|account|"qr|nit/);
  });

  it('responde 304 sin cuerpo cuando el ETag coincide', async () => {
    const first = await request(app.getHttpServer()).get('/store-settings');

    const res = await request(app.getHttpServer())
      .get('/store-settings')
      .set('If-None-Match', first.headers.etag as string)
      .expect(304);

    expect(res.body).toEqual({});
  });

  it('el caché HTTP más el de la tienda (15 s) cabe en los 60 s del requisito', async () => {
    const res = await request(app.getHttpServer()).get('/store-settings');
    const maxAge = Number(/max-age=(\d+)/.exec(res.headers['cache-control'] as string)?.[1]);

    expect(maxAge + 15).toBeLessThanOrEqual(60);
  });
});

describe('Configuración: guardar', () => {
  it('el Gerente guarda y la siguiente lectura anónima ve el cambio con otro ETag', async () => {
    const before = await request(app.getHttpServer()).get('/store-settings');

    await put(tokens.gerente, body()).expect(200);
    const after = await request(app.getHttpServer()).get('/store-settings').expect(200);

    expect(after.body.brandName).toBe('Verashoe');
    expect(after.body.social.instagram).toBe('https://www.instagram.com/verashoe');
    expect(after.headers.etag).not.toBe(before.headers.etag);
  });

  it('la lectura repetida sin cambios mantiene el mismo ETag', async () => {
    await put(tokens.gerente, body()).expect(200);

    const a = await request(app.getHttpServer()).get('/store-settings');
    const b = await request(app.getHttpServer()).get('/store-settings');

    expect(a.headers.etag).toBe(b.headers.etag);
  });
});

describe('Configuración: permisos', () => {
  it('sin sesión 401; Despacho y Atención 403; y no cambia nada', async () => {
    await put(undefined, body()).expect(401);
    await put(tokens.despacho, body()).expect(403);
    await put(tokens.atencion, body()).expect(403);

    const res = await request(app.getHttpServer()).get('/store-settings');
    expect(res.body.brandName).toBe('Clic Moda SC');
  });
});

describe('Configuración: rechazos por campo', () => {
  it('responde 422 con todos los campos inválidos juntos y no guarda nada', async () => {
    const res = await put(
      tokens.gerente,
      body({ brandName: 'x', whatsapp: '71234567', instagram: 'https://evil.com/x' })
    ).expect(422);

    const fields = res.body.issues.map((i: { field: string }) => i.field).sort();
    expect(fields).toEqual(['brandName', 'instagram', 'whatsapp']);
    const read = await request(app.getHttpServer()).get('/store-settings');
    expect(read.body.brandName).toBe('Clic Moda SC');
  });
});

describe('Configuración: contraste e imágenes', () => {
  it('un color sin contraste AA se rechaza y propone uno cercano que sí pasa', async () => {
    const res = await put(tokens.gerente, body({ brandColor: '#e63f6e' })).expect(422);

    expect(res.body.issues[0]).toMatchObject({ field: 'brandColor' });
    expect(res.body.issues[0].message).toContain('#e2245a');
  });

  it('una imagen que no existe se rechaza', async () => {
    const res = await put(
      tokens.gerente,
      body({ logoMediaId: '0a1b2c3d-0000-4000-8000-0000000000ff' })
    ).expect(422);

    expect(res.body.issues).toEqual([
      { field: 'logo', message: 'La imagen elegida no existe o no está publicada' },
    ]);
  });
});

describe('Configuración: logo del módulo de medios', () => {
  it('el logo elegido sale como ruta /m/<id>/logo-<rev>.webp que la API sí sirve', async () => {
    const png = await sharp({
      create: {
        width: 900,
        height: 700,
        channels: 4,
        background: { r: 199, g: 48, b: 90, alpha: 0 },
      },
    })
      .png()
      .toBuffer();
    const up = await request(app.getHttpServer())
      .post('/media')
      .set('Authorization', `Bearer ${tokens.gerente}`)
      .field('alt', 'Logo de la tienda')
      .attach('file', png, { filename: 'logo.png', contentType: 'image/png' })
      .expect(201);

    const saved = await put(tokens.gerente, body({ logoMediaId: up.body.id })).expect(200);

    expect(saved.body.logo.path).toBe(`/m/${up.body.id}/logo-1.webp`);
    await request(app.getHttpServer()).get(`/public/media/${up.body.id}/logo-1.webp`).expect(200);
  });
});
