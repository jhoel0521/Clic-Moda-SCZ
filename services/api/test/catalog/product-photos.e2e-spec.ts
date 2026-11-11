import type { INestApplication } from '@nestjs/common';
import { rm } from 'node:fs/promises';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { call, resetCatalog, seedTokens, startApp, type StaffTokens } from '../support/http.js';

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
  await resetCatalog(app);
  await app.get(DataSource).query('TRUNCATE "media_assets" CASCADE');
});

const jpeg = () =>
  sharp({ create: { width: 1600, height: 1200, channels: 3, background: '#c7305a' } })
    .jpeg()
    .toBuffer();

async function newImage(alt = 'Bota de perfil'): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/media')
    .set('Authorization', `Bearer ${tokens.gerente}`)
    .field('alt', alt)
    .attach('file', await jpeg(), { filename: 'f.jpg', contentType: 'image/jpeg' })
    .expect(201);
  return res.body.id;
}

async function newProduct(): Promise<string> {
  const cat = await call(app, 'post', '/catalog/categories', tokens.gerente, { name: 'Botas' });
  const body = {
    categoryId: cat.body.id,
    name: 'Bota Fotos',
    variants: [{ size: '38', color: 'Negro', price: '100' }],
  };
  return (await call(app, 'post', '/catalog/products', tokens.gerente, body).expect(201)).body.id;
}

const put = (token: string | undefined, id: string, mediaIds: string[]) =>
  call(app, 'put', `/catalog/products/${id}/photos`, token, { mediaIds });

describe('Fotos del producto: permisos', () => {
  it('sin sesión 401; Despacho y Atención 403 y no cambia nada; todos ven las fotos', async () => {
    const [product, image] = [await newProduct(), await newImage()];

    await put(undefined, product, [image]).expect(401);
    await put(tokens.despacho, product, [image]).expect(403);
    await put(tokens.atencion, product, [image]).expect(403);
    await put(tokens.gerente, product, [image]).expect(200);

    for (const token of Object.values(tokens)) {
      const res = await call(app, 'get', `/catalog/products/${product}`, token).expect(200);
      expect(res.body.photos).toEqual([image]);
    }
  });
});

describe('Fotos del producto: orden y reemplazo', () => {
  it('guarda en orden, la primera es la principal, y reordenar reemplaza la lista', async () => {
    const [product, a, b, c] = [
      await newProduct(),
      await newImage(),
      await newImage(),
      await newImage(),
    ];

    await put(tokens.gerente, product, [a, b, c]).expect(200);
    const res = await put(tokens.gerente, product, [c, a]).expect(200);

    expect(res.body.photos).toEqual([c, a]);
    expect(
      (await call(app, 'get', `/catalog/products/${product}`, tokens.gerente)).body.photos
    ).toEqual([c, a]);
  });

  it('un producto puede quedar sin fotos', async () => {
    const [product, image] = [await newProduct(), await newImage()];
    await put(tokens.gerente, product, [image]).expect(200);

    expect((await put(tokens.gerente, product, []).expect(200)).body.photos).toEqual([]);
  });
});

describe('Fotos del producto: rechazos', () => {
  it('rechaza una imagen que no existe con 422 y dice cuál; no cambia nada', async () => {
    const [product, image] = [await newProduct(), await newImage()];
    await put(tokens.gerente, product, [image]).expect(200);

    const res = await put(tokens.gerente, product, [
      image,
      '0a1b2c3d-0000-4000-8000-0000000000ff',
    ]).expect(422);

    expect(res.body.issues).toEqual([
      { field: 'photos.1', message: 'La imagen no existe o no está publicada' },
    ]);
    expect(
      (await call(app, 'get', `/catalog/products/${product}`, tokens.gerente)).body.photos
    ).toEqual([image]);
  });

  it('rechaza repetidas y más de 8 con 400', async () => {
    const [product, image] = [await newProduct(), await newImage()];

    await put(tokens.gerente, product, [image, image]).expect(400);
    const nine = Array.from(
      { length: 9 },
      (_, i) => `0a1b2c3d-0000-4000-8000-${String(i + 1).padStart(12, '0')}`
    );
    await put(tokens.gerente, product, nine).expect(400);
  });
});

describe('Fotos del producto: imagen borrada', () => {
  it('borrar la imagen principal no rompe el producto y la siguiente pasa a ser la principal', async () => {
    const [product, a, b] = [await newProduct(), await newImage(), await newImage()];
    await put(tokens.gerente, product, [a, b]).expect(200);

    await call(app, 'delete', `/media/${a}`, tokens.gerente).expect(204);

    const res = await call(app, 'get', `/catalog/products/${product}`, tokens.gerente).expect(200);
    expect(res.body.photos).toEqual([b]);
  });
});
