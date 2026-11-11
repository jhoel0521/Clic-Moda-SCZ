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
  await app.get(DataSource).query('TRUNCATE "media_assets" CASCADE');
});

const jpeg = (width = 1600, height = 1200) =>
  sharp({ create: { width, height, channels: 3, background: '#c7305a' } })
    .jpeg()
    .toBuffer();

function upload(token: string | undefined, file: Buffer, alt = 'Bota Andes de perfil') {
  const req = request(app.getHttpServer()).post('/media').field('alt', alt);
  if (token) req.set('Authorization', `Bearer ${token}`);
  return req.attach('file', file, { filename: 'foto.jpg', contentType: 'image/jpeg' });
}

async function uploaded(): Promise<{ id: string; variants: { url: string }[] }> {
  return (await upload(tokens.gerente, await jpeg()).expect(201)).body;
}

describe('Imágenes: permisos', () => {
  it('sin sesión responde 401 y Despacho o Atención reciben 403', async () => {
    const file = await jpeg();

    await upload(undefined, file).expect(401);
    await upload(tokens.despacho, file).expect(403);
    await upload(tokens.atencion, file).expect(403);
    await call(app, 'get', '/media', tokens.atencion).expect(403);
  });

  it('no se crea nada cuando se rechaza', async () => {
    await upload(tokens.despacho, await jpeg()).expect(403);

    expect((await call(app, 'get', '/media', tokens.gerente).expect(200)).body).toEqual([]);
  });
});

describe('Imágenes: subida', () => {
  it('crea la imagen con sus siete variantes y rutas públicas', async () => {
    const body = (await upload(tokens.gerente, await jpeg()).expect(201)).body;

    expect(body.variants).toHaveLength(7);
    expect(body.variants.map((v: { url: string }) => v.url)).toContain(`/m/${body.id}/link-1.jpg`);
  });

  it.each([
    ['un archivo que no es imagen', Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>')],
    ['una imagen demasiado pequeña', null],
  ])('rechaza %s con 400', async (_name, file) => {
    await upload(tokens.gerente, file ?? (await jpeg(300, 200))).expect(400);
  });

  it('exige el texto alternativo', async () => {
    await upload(tokens.gerente, await jpeg(), '   ').expect(400);
  });

  it('sin archivo responde 400', async () => {
    await request(app.getHttpServer())
      .post('/media')
      .set('Authorization', `Bearer ${tokens.gerente}`)
      .field('alt', 'Sin foto')
      .expect(400);
  });
});

describe('Imágenes: entrega pública', () => {
  it('sirve la variante sin sesión, con caché inmutable y ETag', async () => {
    const { id } = await uploaded();

    const res = await request(app.getHttpServer())
      .get(`/public/media/${id}/link-1.jpg`)
      .expect(200);

    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.headers.etag).toBe(`"${id}-link-1"`);
    expect((await sharp(res.body).metadata()).width).toBe(1200);
  });

  it('responde 304 sin cuerpo cuando el ETag coincide', async () => {
    const { id } = await uploaded();

    const res = await request(app.getHttpServer())
      .get(`/public/media/${id}/link-1.jpg`)
      .set('If-None-Match', `"${id}-link-1"`)
      .expect(304);

    expect(res.body).toEqual({});
  });
});

const transparentPng = () =>
  sharp({
    create: {
      width: 1000,
      height: 800,
      channels: 4,
      background: { r: 199, g: 48, b: 90, alpha: 0 },
    },
  })
    .png()
    .toBuffer();

async function uploadLogo(): Promise<string> {
  const req = request(app.getHttpServer())
    .post('/media')
    .set('Authorization', `Bearer ${tokens.gerente}`)
    .field('alt', 'Logo de la tienda');
  const file = await transparentPng();
  const res = await req.attach('file', file, { filename: 'logo.png', contentType: 'image/png' });
  return res.body.id;
}

describe('Imágenes: logo con transparencia', () => {
  it('un PNG transparente se sirve como logo WebP con alfa, sin recortar', async () => {
    const id = await uploadLogo();

    const res = await request(app.getHttpServer())
      .get(`/public/media/${id}/logo-1.webp`)
      .expect(200);
    const meta = await sharp(res.body).metadata();

    expect([res.headers['content-type'], meta.width, meta.height, meta.hasAlpha]).toEqual([
      'image/webp',
      640,
      320,
      true,
    ]);
  });
});

describe('Imágenes: entrega pública de lo que no existe', () => {
  it.each(['master.jpg', 'banner-1.jpg', 'link-1.webp', 'link-9.jpg', 'raro'])(
    'responde 404 para %s',
    async (file) => {
      const { id } = await uploaded();

      await request(app.getHttpServer()).get(`/public/media/${id}/${file}`).expect(404);
    }
  );
});

describe('Imágenes: la copia maestra y la edición son privadas', () => {
  it('la maestra solo la ve el Gerente', async () => {
    const { id } = await uploaded();

    await call(app, 'get', `/media/${id}/master`).expect(401);
    await call(app, 'get', `/media/${id}/master`, tokens.atencion).expect(403);
    await call(app, 'get', `/media/${id}/master`, tokens.gerente).expect(200);
  });

  it('reencuadrar crea la revisión 2 y la 1 sigue sirviéndose', async () => {
    const { id } = await uploaded();

    const body = { focalX: 0.2, focalY: 0.8 };
    const res = await call(app, 'patch', `/media/${id}/framing`, tokens.gerente, body).expect(200);

    expect(res.body.revision).toBe(2);
    await request(app.getHttpServer()).get(`/public/media/${id}/story-1.jpg`).expect(200);
    await request(app.getHttpServer()).get(`/public/media/${id}/story-2.jpg`).expect(200);
  });
});

describe('Imágenes: validación y borrado', () => {
  it('un enfoque fuera de rango responde 400', async () => {
    const { id } = await uploaded();

    await call(app, 'patch', `/media/${id}/framing`, tokens.gerente, {
      focalX: 3,
      focalY: 0,
    }).expect(400);
  });

  it('borrar elimina la imagen y su ruta pública deja de existir', async () => {
    const { id } = await uploaded();

    await call(app, 'delete', `/media/${id}`, tokens.despacho).expect(403);
    await call(app, 'delete', `/media/${id}`, tokens.gerente).expect(204);
    await request(app.getHttpServer()).get(`/public/media/${id}/link-1.jpg`).expect(404);
  });
});
