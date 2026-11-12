import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { applyPlan, groupBySlug, parseName, plan } from './seed-photos.mjs';

describe('parseName', () => {
  it('lee slug y orden y reconoce el tipo de imagen', () => {
    assert.deepEqual(parseName('Bota-Andes-2.JPG'), {
      name: 'Bota-Andes-2.JPG',
      slug: 'bota-andes',
      order: 2,
      type: 'image/jpeg',
    });
  });

  it('ignora lo que no tiene el formato <slug>-<n>.<ext>', () => {
    for (const name of ['notas.txt', 'bota.jpg', 'bota-x.jpg', 'bota-1.gif']) {
      assert.equal(parseName(name), null);
    }
  });
});

describe('groupBySlug', () => {
  it('ordena por número (la 1 es la principal) y tope de 8', () => {
    const names = ['a-3.jpg', 'a-1.jpg', 'a-2.png', ...Array.from({ length: 9 }, (_, i) => `b-${i + 1}.jpg`)];

    const groups = groupBySlug(names);

    assert.deepEqual(groups.get('a').map((file) => file.order), [1, 2, 3]);
    assert.equal(groups.get('b').length, 8);
  });
});

describe('plan', () => {
  const groups = groupBySlug(['bota-1.jpg', 'taco-1.jpg', 'ghost-1.jpg']);
  const products = [
    { slug: 'bota', id: '1', name: 'Bota', photos: [] },
    { slug: 'taco', id: '2', name: 'Taco', photos: ['m1'] },
  ];

  it('omite los que no existen y los que ya tienen fotos', () => {
    const skips = plan(groups, products).map((item) => [item.slug, item.skip ?? null]);

    assert.deepEqual(skips, [
      ['bota', null],
      ['taco', 'ya tiene fotos (usa --force)'],
      ['ghost', 'no existe ese producto'],
    ]);
  });

  it('con --force reemplaza las que ya tienen', () => {
    assert.equal(plan(groups, products, { force: true }).find((i) => i.slug === 'taco').skip, undefined);
  });
});

describe('applyPlan', () => {
  it('sube cada foto en orden y las asigna de una vez al producto', async () => {
    const calls = [];
    const fetcher = (url, init) => {
      calls.push([init.method, url.replace('http://api', ''), init.body instanceof FormData ? init.body.get('alt') : init.body]);
      const body = url.endsWith('/media') ? { id: `m${calls.length}` } : {};
      return Promise.resolve(Response.json(body));
    };
    const item = plan(groupBySlug(['bota-2.jpg', 'bota-1.jpg']), [{ slug: 'bota', id: 'P1', name: 'Bota', photos: [] }])[0];

    const count = await applyPlan({ api: 'http://api', fetcher, token: 't' }, item, () => Buffer.from('x'));

    assert.equal(count, 2);
    assert.deepEqual(calls, [
      ['POST', '/media', 'Bota, foto 1'],
      ['POST', '/media', 'Bota, foto 2'],
      ['PUT', '/catalog/products/P1/photos', JSON.stringify({ mediaIds: ['m1', 'm2'] })],
    ]);
  });

  it('si una subida falla no asigna nada', async () => {
    const fetcher = () => Promise.resolve(new Response('no', { status: 422 }));
    const item = plan(groupBySlug(['bota-1.jpg']), [{ slug: 'bota', id: 'P1', name: 'Bota', photos: [] }])[0];

    await assert.rejects(applyPlan({ api: 'http://api', fetcher, token: 't' }, item, () => Buffer.from('x')), /HTTP 422/);
  });
});
