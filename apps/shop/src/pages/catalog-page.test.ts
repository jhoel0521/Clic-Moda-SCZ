import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { card, page, stubApi, type ApiWorld, withWhatsapp } from '../test/api-stub';
import Catalogo from './catalogo.astro';

afterEach(() => vi.unstubAllGlobals());

const FILTERS = { categories: [{ name: 'Botas', slug: 'botas', count: 3 }], sizes: ['38', '39'] };
const run = async (world: ApiWorld, query = '') => {
  stubApi({ settings: withWhatsapp(), filters: FILTERS, ...world });
  const container = await AstroContainer.create();
  return container.renderToResponse(Catalogo, {
    request: new Request(`https://tienda.test/catalogo${query}`),
    locals: { ref: null },
  });
};
const html = async (world: ApiWorld, query = '') => (await run(world, query)).text();

const taco = {
  size: '36',
  color: 'Rojo',
  sku: 'T-36',
  price: '1349.90',
  availability: 'in_stock',
} as const;

describe('catálogo: tarjetas', () => {
  it('cada tarjeta lleva foto con medidas, nombre, precio en Bs y enlace por slug', async () => {
    const out = await html({
      list: page([card(), card({ slug: 'taco-luna', name: 'Taco Luna', variants: [taco] })]),
    });

    expect(out).toContain('href="/p/bota-andes?talla=38&amp;color=Negro"');
    expect(out).toContain('Bs 1.349,90');
    expect(out).toContain('width="800" height="1000"');
    expect(out).toContain('2 productos');
  });

  it('las dos primeras fotos cargan de inmediato y el resto con carga diferida', async () => {
    const items = ['a', 'b', 'c'].map((slug) => card({ slug, name: slug }));

    const out = await html({ list: page(items) });

    expect(out.match(/loading="eager"/g)).toHaveLength(2);
    expect(out.match(/loading="lazy"/g)).toHaveLength(1);
  });
});

describe('catálogo: la tarjeta dice qué variante muestra', () => {
  it('muestra el color, la talla y el precio de esa combinación, y las tallas como enlaces', async () => {
    const out = await html({ list: page([card()]) });

    expect(out).toContain('Bs 349,90');
    expect(out).toContain('Negro · Talla 38');
    expect(out).toContain('href="/p/bota-andes?talla=39&amp;color=Negro"');
  });

  it('las tallas agotadas no se muestran si hay otras disponibles', async () => {
    const out = await html({ list: page([card()]) });

    expect(out).toContain('aria-label="Tallas"');
    expect(out).toContain('talla=39');
    expect(out).not.toContain('talla=40');
    expect(out).not.toContain('(agotada)');
  });

  it('con todo agotado no ofrece tallas y lleva al detalle sin elegir', async () => {
    const variants = card().variants.map((variant) => ({
      ...variant,
      availability: 'out' as const,
    }));

    const out = await html({ list: page([card({ availability: 'out', variants })]) });

    expect(out).not.toContain('aria-label="Tallas"');
    expect(out).toContain('href="/p/bota-andes"');
  });
});

describe('catálogo: colores de la tarjeta', () => {
  const two = [
    { size: '36', color: 'Rojo', sku: 'R36', price: '305.00', availability: 'in_stock' },
    { size: '36', color: 'Azul marino', sku: 'A36', price: '320.00', availability: 'in_stock' },
  ] as const;

  it('con varios colores muestra un círculo por color con su nombre y enlace', async () => {
    const out = await html({ list: page([card({ variants: [...two] })]) });

    expect(out).toContain('aria-label="Color Rojo"');
    expect(out).toContain('aria-label="Color Azul marino"');
    expect(out).toContain('href="/p/bota-andes?talla=36&amp;color=Azul+marino"');
  });

  it('con un solo color no muestra círculos', async () => {
    expect(await html({ list: page([card()]) })).not.toContain('aria-label="Colores"');
  });
});

describe('catalog-page (2)', () => {
  it('avisa "Últimas unidades" y "Agotada" con texto', async () => {
    const out = await html({
      list: page([
        card({ slug: 'a', availability: 'low' }),
        card({ slug: 'b', availability: 'out' }),
      ]),
    });

    expect(out).toContain('Últimas unidades');
    expect(out).toContain('Agotada');
  });
});

describe('catálogo: filtros en la URL', () => {
  it('muestra "Filtrar (2)" y un chip por filtro que lo quita con un toque', async () => {
    const out = await html({ list: page([card()]) }, '?categoria=botas&talla=38');

    expect(out).toContain('Filtrar (2)');
    expect(out).toContain('aria-label="Quitar el filtro Botas"');
    expect(out).toContain('href="/catalogo?talla=38"');
  });

  it('le pide a la API exactamente esos filtros', async () => {
    await html(
      { list: page([card()]) },
      '?categoria=botas&talla=38&orden=precio-asc&disponibles=1'
    );

    const calls = (fetch as unknown as { mock: { calls: [string][] } }).mock.calls.map(([url]) =>
      String(url)
    );
    expect(
      calls.some((url) => url.includes('category=botas&size=38&available=true&sort=price_asc'))
    ).toBe(true);
  });
});

describe('catalog-page (3)', () => {
  it('sin resultados lo dice y ofrece quitar los filtros', async () => {
    const out = await html({ list: page([]) }, '?q=zzz');

    expect(out).toContain('No encontramos productos con esos filtros');
    expect(out).toContain('Quitar los filtros');
  });

  it('el formulario funciona sin JavaScript: método GET hacia /catalogo', async () => {
    const out = await html({ list: page([card()]) });

    expect(out).toContain('method="get" action="/catalogo"');
    expect(out).toContain('name="talla"');
  });
});

describe('catálogo: páginas, canónica y fallos', () => {
  it('la paginación conserva los filtros y usa rel prev/next', async () => {
    const out = await html(
      { list: page([card()], { total: 30, page: 2 }) },
      '?categoria=botas&pagina=2'
    );

    expect(out).toContain('rel="prev"');
    expect(out).toContain('href="/catalogo?categoria=botas"');
    expect(out).toMatch(/href="\/catalogo\?categoria=botas&(#38|amp);pagina=3"/);
    expect(out).toContain('Página 2 de 3');
  });

  it('la canónica ignora los filtros y conserva solo la página', async () => {
    const filtered = await html({ list: page([card()]) }, '?categoria=botas&talla=38');
    const second = await html({ list: page([card()], { total: 30, page: 2 }) }, '?pagina=2');

    expect(filtered).toContain('<link rel="canonical" href="https://tienda.test/catalogo">');
    expect(second).toContain('href="https://tienda.test/catalogo?pagina=2"');
  });

  it('si la API no responde responde 503 con un mensaje y un botón para reintentar', async () => {
    const response = await run({ list: new Error('API caída') });

    expect(response.status).toBe(503);
    const out = await response.text();
    expect(out).toContain('No pudimos cargar el catálogo por ahora');
    expect(out).toContain('Reintentar');
  });
});
