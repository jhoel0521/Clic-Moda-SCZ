import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '../lib/catalog';
import { detail, stubApi, withWhatsapp } from '../test/api-stub';
import Product_ from './p/[slug].astro';

afterEach(() => vi.unstubAllGlobals());

const html = async (query = '', slug = 'bota-andes') => {
  const container = await AstroContainer.create();
  const request = new Request(`https://tienda.test/p/${slug}${query}`);
  return (
    await container.renderToResponse(Product_, { params: { slug }, request, locals: { ref: null } })
  ).text();
};
const world = (product: Product | null | Error) => stubApi({ settings: withWhatsapp(), product });
const ldOf = (page: string): string =>
  /<script type="application\/ld\+json">(.*?)<\/script>/s.exec(page)?.[1] ?? '';

describe('detalle: etiquetas de búsqueda y compartir', () => {
  it('canónica y og:url son siempre /p/<slug>, sin talla, color ni ref', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro&ref=live-nov');

    expect(page).toContain('<link rel="canonical" href="https://tienda.test/p/bota-andes">');
    expect(page).toContain('property="og:url" content="https://tienda.test/p/bota-andes"');
  });

  it('og:image es el formato link de la foto principal y el tipo es product', async () => {
    world(detail());

    const page = await html();

    expect(page).toContain('property="og:image" content="https://tienda.test/m/a/link-1.jpg"');
    expect(page).toContain('property="og:type" content="product"');
    expect(page).toContain('name="twitter:card" content="summary_large_image"');
  });

  it('no emite noindex', async () => {
    world(detail());

    expect(await html()).not.toMatch(/noindex/i);
  });

  it('sin descripción arma la de búsqueda con nombre, categoría y precio', async () => {
    world(detail({ description: null }));

    expect(await html()).toContain('Bota Andes en Botas por Bs 349,90.');
  });
});

describe('detalle: datos estructurados', () => {
  it('trae un bloque JSON-LD Product válido con la oferta y la disponibilidad', async () => {
    world(detail());

    const data = JSON.parse(ldOf(await html()));

    expect(data['@type']).toBe('Product');
    expect(data.offers[0]).toMatchObject({
      priceCurrency: 'BOB',
      availability: 'https://schema.org/InStock',
    });
    expect(data.image[0]).toBe('https://tienda.test/m/a/link-1.jpg');
  });

  it('un nombre con </script> no se sale del bloque y el JSON sigue siendo válido', async () => {
    const name = '</script><script>alert(1)</script>';
    world(detail({ name }));

    const page = await html();

    expect(ldOf(page)).not.toContain('<');
    expect(JSON.parse(ldOf(page)).name).toBe(name);
    // Fuera de los atributos entre comillas (donde un `<` es inerte) no queda ningún `</script>` ajeno.
    expect(page.replace(/="[^"]*"/g, '')).not.toContain('</script><script>alert(1)');
  });
});

describe('detalle: errores', () => {
  it('un producto que no existe responde 404 con una salida al catálogo', async () => {
    world(null);
    const container = await AstroContainer.create();
    const request = new Request('https://tienda.test/p/nada');

    const response = await container.renderToResponse(Product_, {
      params: { slug: 'nada' },
      request,
      locals: { ref: null },
    });

    expect(response.status).toBe(404);
    expect(await response.text()).toContain('href="/catalogo"');
  });
});

describe('product-seo (2)', () => {
  it('si la API no responde la página sigue viva con 503 y un mensaje', async () => {
    world(new Error('API caída'));
    const container = await AstroContainer.create();
    const request = new Request('https://tienda.test/p/bota-andes');

    const response = await container.renderToResponse(Product_, {
      params: { slug: 'bota-andes' },
      request,
      locals: { ref: null },
    });

    expect(response.status).toBe(503);
    expect(await response.text()).toContain('no está disponible por ahora');
  });
});
