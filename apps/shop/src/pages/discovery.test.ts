import { afterEach, describe, expect, it, vi } from 'vitest';
import { card, page, stubApi } from '../test/api-stub';
import { GET as robots } from './robots.txt';
import { GET as sitemap } from './sitemap.xml';

afterEach(() => vi.unstubAllGlobals());

const context = (path: string) =>
  ({ url: new URL(`https://tienda.test${path}`) }) as Parameters<typeof sitemap>[0];

describe('sitemap.xml y robots.txt', () => {
  it('el sitemap lista cada producto publicado con su fecha y es XML', async () => {
    stubApi({
      list: page([card()]),
      slugs: [{ slug: 'bota-andes', updatedAt: '2026-11-02T00:00:00.000Z' }],
    });

    const response = await sitemap(context('/sitemap.xml'));
    const xml = await response.text();

    expect(response.headers.get('content-type')).toContain('application/xml');
    expect(xml).toContain(
      '<loc>https://tienda.test/p/bota-andes</loc><lastmod>2026-11-02T00:00:00.000Z</lastmod>'
    );
    expect(xml).toContain('<loc>https://tienda.test/catalogo</loc>');
  });

  it('si el catálogo no responde publica solo lo fijo en vez de fallar', async () => {
    stubApi({ slugs: undefined });
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('API caída')))
    );

    const xml = await (await sitemap(context('/sitemap.xml'))).text();

    expect(xml).toContain('<loc>https://tienda.test/contacto</loc>');
    expect(xml).not.toContain('/p/');
  });
});

describe('discovery (2)', () => {
  it('robots.txt referencia el sitemap con la URL absoluta', async () => {
    const text = await (await robots(context('/robots.txt'))).text();

    expect(text).toContain('Sitemap: https://tienda.test/sitemap.xml');
    expect(text).toContain('Allow: /');
  });
});
