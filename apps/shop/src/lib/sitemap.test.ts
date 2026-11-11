import { describe, expect, it } from 'vitest';
import { buildRobots, buildSitemap } from './sitemap';

const ORIGIN = 'https://tienda.test';

describe('buildSitemap', () => {
  it('incluye la portada, el catálogo, contacto y cada producto con su fecha', () => {
    const xml = buildSitemap(ORIGIN, [
      { slug: 'bota-andes', updatedAt: '2026-11-02T00:00:00.000Z' },
    ]);

    for (const loc of [
      'https://tienda.test/',
      'https://tienda.test/catalogo',
      'https://tienda.test/contacto',
    ]) {
      expect(xml).toContain(`<loc>${loc}</loc>`);
    }
    expect(xml).toContain(
      '<loc>https://tienda.test/p/bota-andes</loc><lastmod>2026-11-02T00:00:00.000Z</lastmod>'
    );
  });

  it('una entrada por producto, sin tope (no depende de la paginación del listado)', () => {
    const slugs = Array.from({ length: 120 }, (_, i) => ({
      slug: `p-${String(i)}`,
      updatedAt: '2026-11-02T00:00:00.000Z',
    }));

    expect(buildSitemap(ORIGIN, slugs).match(/\/p\//g)).toHaveLength(120);
  });
});

describe('sitemap (2)', () => {
  it('escapa los caracteres especiales del XML', () => {
    const xml = buildSitemap(ORIGIN, [{ slug: 'a&b', updatedAt: 'a&b' }]);

    expect(xml).not.toContain('a&b');
    expect(xml).toContain('a&#38;b');
  });

  it('no repite ningún producto inactivo: solo publica lo que recibe', () => {
    expect(buildSitemap(ORIGIN, [])).not.toContain('/p/');
  });
});

describe('buildRobots', () => {
  it('permite todo y referencia el sitemap con la URL absoluta', () => {
    expect(buildRobots(ORIGIN)).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://tienda.test/sitemap.xml\n'
    );
  });
});
