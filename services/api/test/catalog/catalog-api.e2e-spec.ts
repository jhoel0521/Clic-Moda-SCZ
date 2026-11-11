import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';
import { call, resetCatalog, seedTokens, startApp, type StaffTokens } from '../support/http.js';

let app: INestApplication<App>;
let tokens: StaffTokens;

beforeAll(async () => {
  app = await startApp();
  tokens = await seedTokens(app);
});

afterAll(async () => {
  await app.close();
});

beforeEach(async () => {
  await resetCatalog(app);
});

const variant = (size: string, extra: object = {}) => ({
  size,
  color: 'Negro',
  price: '349.90',
  ...extra,
});

async function newCategory(name = 'Botas'): Promise<string> {
  const res = await call(app, 'post', '/catalog/categories', tokens.gerente, { name }).expect(201);
  return res.body.id;
}

async function newProduct(categoryId: string, name = 'Bota Chelsea') {
  const body = { categoryId, name, variants: [variant('38'), variant('39')] };
  return (await call(app, 'post', '/catalog/products', tokens.gerente, body).expect(201)).body;
}

describe('Categorías: acceso por rol', () => {
  it('sin sesión responde 401 y con sesión del personal el listado responde 200', async () => {
    await call(app, 'get', '/catalog/categories').expect(401);
    for (const token of Object.values(tokens)) {
      await call(app, 'get', '/catalog/categories', token).expect(200);
    }
  });

  it('solo el Gerente escribe: Despacho y Atención reciben 403 y no se crea nada', async () => {
    for (const token of [tokens.despacho, tokens.atencion]) {
      await call(app, 'post', '/catalog/categories', token, { name: 'Botas' }).expect(403);
    }
    expect((await call(app, 'get', '/catalog/categories', tokens.gerente)).body).toEqual([]);
  });
});

describe('Categorías: reglas', () => {
  it('crea con slug, rechaza duplicados (409) y nombres inválidos (400)', async () => {
    const created = await call(app, 'post', '/catalog/categories', tokens.gerente, {
      name: 'Zapatillas Urbanas',
    }).expect(201);
    expect(created.body).toMatchObject({ slug: 'zapatillas-urbanas', productCount: 0 });
    await call(app, 'post', '/catalog/categories', tokens.gerente, {
      name: 'zapatillas urbanas ',
    }).expect(409);
    await call(app, 'post', '/catalog/categories', tokens.gerente, { name: 'A' }).expect(400);
  });

  it('edita el nombre y borra solo si no tiene productos', async () => {
    const id = await newCategory();
    await call(app, 'patch', `/catalog/categories/${id}`, tokens.gerente, {
      name: 'Botines',
    }).expect(200);
    await newProduct(id);

    await call(app, 'delete', `/catalog/categories/${id}`, tokens.gerente).expect(409);
    const empty = await newCategory('Vacía');
    await call(app, 'delete', `/catalog/categories/${empty}`, tokens.gerente).expect(204);
  });
});

describe('Productos: registro', () => {
  it('registra con variantes, SKU generados y precio exacto', async () => {
    const product = await newProduct(await newCategory());

    expect(product.variants.map((x: { sku: string }) => x.sku)).toEqual([
      'BOT-38-NEG',
      'BOT-39-NEG',
    ]);
    expect(product.variants[0].price).toBe('349.90');
  });

  it('es atómico: un precio inválido o un SKU repetido no guardan nada', async () => {
    const categoryId = await newCategory();
    const bad = {
      categoryId,
      name: 'Bota',
      variants: [variant('38'), variant('39', { price: '0' })],
    };
    await call(app, 'post', '/catalog/products', tokens.gerente, bad).expect(400);
    await newProduct(categoryId);
    const dup = { categoryId, name: 'Otra', variants: [variant('40', { sku: 'bot-38-neg' })] };

    await call(app, 'post', '/catalog/products', tokens.gerente, dup).expect(409);
    expect((await call(app, 'get', '/catalog/products', tokens.gerente)).body.total).toBe(1);
  });
});

describe('Productos: permisos', () => {
  it('Despacho y Atención no registran (403) y una categoría inexistente da 404', async () => {
    const categoryId = await newCategory();
    const body = { categoryId, name: 'Bota', variants: [variant('38')] };
    for (const token of [tokens.despacho, tokens.atencion]) {
      await call(app, 'post', '/catalog/products', token, body).expect(403);
    }
    const missing = { ...body, categoryId: '00000000-0000-4000-8000-000000000000' };
    await call(app, 'post', '/catalog/products', tokens.gerente, missing).expect(404);
  });
});

describe('Productos: consulta y edición', () => {
  it('busca por SKU o nombre, pagina y devuelve el detalle (404 si no existe)', async () => {
    const product = await newProduct(await newCategory());
    const found = await call(
      app,
      'get',
      '/catalog/products?text=bot-38&pageSize=1',
      tokens.atencion
    ).expect(200);

    expect([found.body.total, found.body.items[0].id]).toEqual([1, product.id]);
    await call(app, 'get', `/catalog/products/${product.id}`, tokens.despacho).expect(200);
    await call(
      app,
      'get',
      '/catalog/products/00000000-0000-4000-8000-000000000000',
      tokens.gerente
    ).expect(404);
    await call(app, 'get', '/catalog/products?pageSize=500', tokens.gerente).expect(400);
  });
});

describe('Productos: edición', () => {
  it('el Gerente edita el producto y cambia el precio y el SKU de una variante', async () => {
    const product = await newProduct(await newCategory());
    const variantId = product.variants[0].id;
    await call(app, 'patch', `/catalog/products/${product.id}`, tokens.gerente, {
      name: 'Bota Pro',
    }).expect(200);

    const edited = await call(app, 'patch', `/catalog/variants/${variantId}`, tokens.gerente, {
      price: '400',
      sku: 'nuevo-1',
    }).expect(200);
    expect(edited.body.name).toBe('Bota Pro');
    expect(edited.body.variants[0]).toMatchObject({ price: '400.00', sku: 'NUEVO-1' });
  });
});

describe('Productos: estado', () => {
  it('desactiva producto y variante sin borrarlos; Atención no puede editar (403)', async () => {
    const product = await newProduct(await newCategory());
    const off = await call(app, 'patch', `/catalog/products/${product.id}/active`, tokens.gerente, {
      active: false,
    }).expect(200);
    expect([off.body.active, off.body.variants.length]).toEqual([false, 2]);
    await call(app, 'patch', `/catalog/variants/${product.variants[0].id}/active`, tokens.gerente, {
      active: false,
    }).expect(200);

    await call(app, 'patch', `/catalog/products/${product.id}`, tokens.atencion, {
      name: 'X1',
    }).expect(403);
  });
});
