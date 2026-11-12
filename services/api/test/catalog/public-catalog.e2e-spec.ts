import type { INestApplication } from '@nestjs/common';
import { rm } from 'node:fs/promises';
import sharp from 'sharp';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { ProcessNextStockCommandUseCase } from '../../src/inventory/application/use-cases/process-next-stock-command.use-case.js';
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

const get = (path: string) => request(app.getHttpServer()).get(`/public/catalog${path}`);

async function drain(): Promise<void> {
  const useCase = app.get(ProcessNextStockCommandUseCase);
  while (await useCase.execute()) continue;
}

async function category(name = 'Botas'): Promise<{ id: string; slug: string }> {
  const res = await call(app, 'post', '/catalog/categories', tokens.gerente, { name }).expect(201);
  return res.body;
}

interface NewProduct {
  name: string;
  categoryId: string;
  sizes?: string[];
  price?: string;
}

async function product({ name, categoryId, sizes = ['38'], price = '349.90' }: NewProduct) {
  const variants = sizes.map((size) => ({ size, color: 'Negro', price }));
  const body = { categoryId, name, variants };
  return (await call(app, 'post', '/catalog/products', tokens.gerente, body).expect(201)).body;
}

async function receive(variantId: string, units: number): Promise<void> {
  const body = { variantId, type: 'RECEIVE', units, reason: 'Prueba e2e' };
  await call(app, 'post', '/inventory/commands', tokens.gerente, body).expect(202);
  await drain();
}

async function image(): Promise<string> {
  const png = await sharp({
    create: { width: 1600, height: 1200, channels: 3, background: '#c7305a' },
  })
    .jpeg()
    .toBuffer();
  const res = await request(app.getHttpServer())
    .post('/media')
    .set('Authorization', `Bearer ${tokens.gerente}`)
    .field('alt', 'Bota de perfil')
    .attach('file', png, { filename: 'f.jpg', contentType: 'image/jpeg' })
    .expect(201);
  return res.body.id;
}

describe('Catálogo público: solo lo vendible', () => {
  it('no exige sesión y publica el producto activo con su categoría', async () => {
    const cat = await category();
    await product({ name: 'Bota Andes', categoryId: cat.id });

    const res = await get('').expect(200);

    expect(res.body.total).toBe(1);
    expect(res.body.items[0]).toMatchObject({
      slug: 'bota-andes',
      name: 'Bota Andes',
      category: { slug: 'botas' },
    });
  });

  it('un producto inactivo no aparece en el listado ni por slug (404)', async () => {
    const cat = await category();
    const hidden = await product({ name: 'Bota Oculta', categoryId: cat.id });
    await call(app, 'patch', `/catalog/products/${hidden.id}/active`, tokens.gerente, {
      active: false,
    }).expect(200);

    expect((await get('').expect(200)).body.total).toBe(0);
    await get('/products/bota-oculta').expect(404);
  });
});

describe('Catálogo público: categoría y variantes inactivas', () => {
  it('una categoría inactiva oculta sus productos y desaparece de los filtros', async () => {
    const cat = await category();
    await product({ name: 'Bota Andes', categoryId: cat.id });
    await app.get(DataSource).query('UPDATE categories SET active = false WHERE id = $1', [cat.id]);

    expect((await get('').expect(200)).body.total).toBe(0);
    await get('/products/bota-andes').expect(404);
    expect((await get('/filters').expect(200)).body.categories).toEqual([]);
  });
});

describe('Catálogo público: variantes inactivas', () => {
  it('una variante inactiva no se muestra y sin variantes activas el producto no se publica', async () => {
    const cat = await category();
    const p = await product({ name: 'Bota Dos', categoryId: cat.id, sizes: ['38', '39'] });
    await call(app, 'patch', `/catalog/variants/${p.variants[0].id}/active`, tokens.gerente, {
      active: false,
    }).expect(200);
    expect(
      (await get('/products/bota-dos').expect(200)).body.variants.map(
        (v: { size: string }) => v.size
      )
    ).toEqual(['39']);

    await call(app, 'patch', `/catalog/variants/${p.variants[1].id}/active`, tokens.gerente, {
      active: false,
    }).expect(200);
    await get('/products/bota-dos').expect(404);
  });
});

describe('Catálogo público: nada interno', () => {
  it('no trae ubicación, reposición, cantidades ni identificadores internos', async () => {
    const cat = await category();
    const p = await product({ name: 'Bota Andes', categoryId: cat.id });
    await receive(p.variants[0].id, 12);
    await app.get(DataSource).query("UPDATE stock_levels SET location = 'A-12', reorder_level = 5");

    const list = JSON.stringify((await get('').expect(200)).body);
    const detail = JSON.stringify((await get('/products/bota-andes').expect(200)).body);

    for (const body of [list, detail]) {
      expect(body).not.toMatch(
        /A-12|reorder|location|onHand|reserved|available|"id"|categoryId|cost/i
      );
    }
  });
});

const DETAIL_KEYS = [
  'availability',
  'category',
  'description',
  'name',
  'photos',
  'price',
  'priceVaries',
  'slug',
  'updatedAt',
  'variants',
];

describe('Catálogo público: claves permitidas', () => {
  it('las claves del detalle son exactamente las permitidas', async () => {
    const cat = await category();
    await product({ name: 'Bota Andes', categoryId: cat.id });

    const body = (await get('/products/bota-andes').expect(200)).body;

    expect(Object.keys(body).sort()).toEqual([...DETAIL_KEYS].sort());
    expect(Object.keys(body.variants[0]).sort()).toEqual([
      'availability',
      'color',
      'price',
      'size',
      'sku',
    ]);
  });
});

describe('Catálogo público: disponibilidad', () => {
  it('muestra in_stock, low y out según el disponible, sin cantidades', async () => {
    const cat = await category();
    const p = await product({ name: 'Bota Andes', categoryId: cat.id, sizes: ['38', '39', '40'] });
    await receive(p.variants[0].id, 2);
    await receive(p.variants[1].id, 40);

    const detail = (await get('/products/bota-andes').expect(200)).body;

    const bySize = Object.fromEntries(
      detail.variants.map((v: { size: string; availability: string }) => [v.size, v.availability])
    );
    expect(bySize).toEqual({ '38': 'low', '39': 'in_stock', '40': 'out' });
    expect(detail.availability).toBe('in_stock');
  });
});

describe('Catálogo público: precio por variante', () => {
  it('cada talla muestra su precio y el producto sale "desde" el menor', async () => {
    const cat = await category();
    const variants = [
      { size: '36', color: 'Rojo', price: '305' },
      { size: '37', color: 'Rojo', price: '350' },
    ];
    await call(app, 'post', '/catalog/products', tokens.gerente, {
      categoryId: cat.id,
      name: 'Sandalia Roja',
      variants,
    }).expect(201);

    const detail = (await get('/products/sandalia-roja').expect(200)).body;
    const list = (await get('').expect(200)).body.items[0];

    expect(detail.variants.map((v: { price: string }) => v.price)).toEqual(['305.00', '350.00']);
    expect([list.price, list.priceVaries]).toEqual(['305.00', true]);
  });
});

describe('Catálogo público: todo agotado', () => {
  it('un producto con todo agotado sigue publicado como out', async () => {
    const cat = await category();
    await product({ name: 'Bota Agotada', categoryId: cat.id });

    const res = await get('').expect(200);

    expect(res.body.items[0].availability).toBe('out');
  });
});

async function seedThree() {
  const botas = await category('Botas');
  const tacos = await category('Tacos');
  const a = await product({
    name: 'Bota Andes',
    categoryId: botas.id,
    sizes: ['38', '39'],
    price: '300',
  });
  const b = await product({
    name: 'Taco Luna',
    categoryId: tacos.id,
    sizes: ['36'],
    price: '150',
  });
  await product({ name: 'Bota Sol', categoryId: botas.id, sizes: ['38'], price: '500' });
  await receive(a.variants[0].id, 10);
  await receive(b.variants[0].id, 10);
}

describe('Catálogo público: filtros y orden', () => {
  it('filtra por categoría, talla y texto', async () => {
    await seedThree();

    const names = async (query: string) =>
      (await get(query).expect(200)).body.items.map((item: { name: string }) => item.name).sort();

    expect(await names('?category=tacos')).toEqual(['Taco Luna']);
    expect(await names('?size=38')).toEqual(['Bota Andes', 'Bota Sol']);
    expect(await names('?q=luna')).toEqual(['Taco Luna']);
  });
});

describe('Catálogo público: solo disponible', () => {
  it('"solo disponible" excluye los agotados', async () => {
    await seedThree();

    const res = await get('?available=true').expect(200);

    expect(res.body.items.map((item: { name: string }) => item.name).sort()).toEqual([
      'Bota Andes',
      'Taco Luna',
    ]);
  });
});

describe('Catálogo público: orden por precio', () => {
  it('ordena por precio del modelo', async () => {
    await seedThree();

    const asc = (await get('?sort=price_asc').expect(200)).body.items.map(
      (i: { price: string }) => i.price
    );
    const desc = (await get('?sort=price_desc').expect(200)).body.items.map(
      (i: { price: string }) => i.price
    );

    expect(asc).toEqual(['150.00', '300.00', '500.00']);
    expect(desc).toEqual(['500.00', '300.00', '150.00']);
  });
});

describe('Catálogo público: opciones de filtro', () => {
  it('filtros: categorías con conteo y tallas ordenadas como número', async () => {
    await seedThree();

    const res = await get('/filters').expect(200);

    expect(res.body.categories).toEqual([
      { name: 'Botas', slug: 'botas', count: 2 },
      { name: 'Tacos', slug: 'tacos', count: 1 },
    ]);
    expect(res.body.sizes).toEqual(['36', '38', '39']);
  });
});

describe('Catálogo público: paginación y slugs', () => {
  it('acota 500 por página a 48 y avisa el total', async () => {
    const cat = await category();
    await product({ name: 'Bota Uno', categoryId: cat.id });

    const res = await get('?pageSize=500').expect(200);

    expect([res.body.pageSize, res.body.total]).toEqual([48, 1]);
  });

  it('la lectura liviana de slugs devuelve todos los publicados', async () => {
    const cat = await category();
    for (const name of ['Bota Uno', 'Bota Dos', 'Bota Tres'])
      await product({ name, categoryId: cat.id });

    const res = await get('/slugs').expect(200);

    expect(res.body.map((item: { slug: string }) => item.slug)).toEqual([
      'bota-dos',
      'bota-tres',
      'bota-uno',
    ]);
    expect(res.body[0].updatedAt).toMatch(/T/);
  });

  it('un slug desconocido responde 404', async () => {
    await get('/products/no-existe').expect(404);
  });
});

describe('Catálogo público: caché', () => {
  it('lleva ETag fuerte y caché de 15 s, y responde 304 si no cambió', async () => {
    const cat = await category();
    await product({ name: 'Bota Andes', categoryId: cat.id });

    const first = await get('').expect(200);
    const again = await get('')
      .set('If-None-Match', first.headers.etag as string)
      .expect(304);

    expect(first.headers['cache-control']).toBe('public, max-age=15');
    expect(first.headers.etag).toMatch(/^"[0-9a-f]{40}"$/);
    expect(again.body).toEqual({});
  });
});

describe('Catálogo público: fotos', () => {
  it('trae las rutas de la tienda de la foto principal y omite la borrada', async () => {
    const cat = await category();
    const p = await product({ name: 'Bota Andes', categoryId: cat.id });
    const [a, b] = [await image(), await image()];
    await call(app, 'put', `/catalog/products/${p.id}/photos`, tokens.gerente, {
      mediaIds: [a, b],
    }).expect(200);

    expect((await get('').expect(200)).body.items[0].photo.card).toBe(`/m/${a}/card-1.webp`);
    await call(app, 'delete', `/media/${a}`, tokens.gerente).expect(204);

    const detail = (await get('/products/bota-andes').expect(200)).body;
    expect(detail.photos.map((photo: { card: string }) => photo.card)).toEqual([
      `/m/${b}/card-1.webp`,
    ]);
  });
});

// Cuenta las consultas SQL que llegan a Postgres mientras se ejecuta `action`.
async function countQueries(action: () => Promise<unknown>): Promise<number> {
  const runner = app.get(DataSource).createQueryRunner();
  const proto = Object.getPrototypeOf(runner) as {
    query: (...args: unknown[]) => Promise<unknown>;
  };
  const original = proto.query;
  let count = 0;
  proto.query = function (this: unknown, ...args: unknown[]) {
    count += 1;
    return original.apply(this, args);
  };
  try {
    await action();
  } finally {
    proto.query = original;
    await runner.release();
  }
  return count;
}

async function withPhotos(
  from: number,
  to: number,
  categoryId: string,
  photos: string[]
): Promise<void> {
  for (let n = from; n <= to; n++) {
    const p = await product({ name: `Bota ${String(n).padStart(2, '0')}`, categoryId });
    await call(app, 'put', `/catalog/products/${p.id}/photos`, tokens.gerente, {
      mediaIds: photos,
    }).expect(200);
  }
}

describe('Catálogo público: sin N+1', () => {
  it('el listado de 48 productos con fotos hace las mismas consultas que el de 3', async () => {
    const cat = await category();
    const photos = [await image(), await image(), await image()];
    await withPhotos(1, 3, cat.id, photos);
    const few = await countQueries(() => get('?pageSize=48').expect(200));
    await withPhotos(4, 48, cat.id, photos);

    const many = await countQueries(() => get('?pageSize=48').expect(200));

    expect((await get('?pageSize=48').expect(200)).body.items).toHaveLength(48);
    expect(many).toBe(few);
    expect(many).toBeLessThanOrEqual(6);
  }, 180_000);
});

describe('Catálogo público: plazo del stock', () => {
  it('una salida procesada por la cola se ve como agotada en la lectura pública siguiente', async () => {
    const cat = await category();
    const p = await product({ name: 'Bota Andes', categoryId: cat.id });
    await receive(p.variants[0].id, 2);
    expect((await get('/products/bota-andes').expect(200)).body.availability).toBe('low');

    const withdraw = { variantId: p.variants[0].id, type: 'WITHDRAW', units: 2, reason: 'Venta' };
    await call(app, 'post', '/inventory/commands', tokens.gerente, withdraw).expect(202);
    await drain();

    expect((await get('/products/bota-andes').expect(200)).body.availability).toBe('out');
  });
});
