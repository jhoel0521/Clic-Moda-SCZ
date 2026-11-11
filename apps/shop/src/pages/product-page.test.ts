import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { detail, stubApi, withWhatsapp } from '../test/api-stub';
import type { Product } from '../lib/catalog';
import Product_ from './p/[slug].astro';

afterEach(() => vi.unstubAllGlobals());

const ORIGIN = 'https://tienda.test';
const run = async (query = '', ref: string | null = null) => {
  const container = await AstroContainer.create();
  const request = new Request(`${ORIGIN}/p/bota-andes${query}`);
  return container.renderToResponse(Product_, {
    params: { slug: 'bota-andes' },
    request,
    locals: { ref },
  });
};
const html = async (query = '', ref: string | null = null) => (await run(query, ref)).text();
const world = (product: Product | null | Error, number = '59171234567') =>
  stubApi({ settings: withWhatsapp(number), product });

describe('detalle: contenido', () => {
  it('muestra nombre, precio en Bs, descripción, categoría y la galería con todas las fotos', async () => {
    world(detail());

    const page = await html();

    for (const text of ['Bota Andes', 'Bs 349,90', 'Cuero genuino', 'Botas'])
      expect(page).toContain(text);
    expect(page).toContain('/m/a/card-1.webp');
    expect(page).toContain('/m/b/card-1.webp');
    expect(page).toContain('aria-label="Fotos de Bota Andes"');
  });

  it('las imágenes declaran ancho y alto y la principal carga con prioridad', async () => {
    world(detail());

    const page = await html();

    expect(page).toContain('width="800" height="1000" loading="eager" fetchpriority="high"');
    expect(page).toContain('loading="lazy"');
  });

  it('sin fotos muestra un recuadro con el nombre y no una imagen rota', async () => {
    world(detail({ photos: [] }));

    const page = await html();

    expect(page).not.toContain('card-1.webp');
    expect(page).toContain('aspect-[4/5]');
  });
});

describe('detalle: talla y color', () => {
  it('talla y color son grupos con título; las agotadas dicen "Agotada" y están desactivadas', async () => {
    world(detail());

    const page = await html();

    expect(page).toContain('<legend class="mb-1 font-semibold">Talla</legend>');
    expect(page).toMatch(/value="40"[^>]*disabled/);
    expect(page).toContain('Agotada');
    expect(page).toContain('Últimas');
  });

  it('la elección viene de la URL: talla y color quedan marcados sin JavaScript', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro');

    expect(page).toMatch(/value="38"[^>]*checked/);
    expect(page).toContain('data-variant-form');
    expect(page).toContain('no-js-only');
  });
});

// El enlace de WhatsApp del producto (la cabecera y el pie tienen otros con un texto genérico).
const productLink = (page: string): string =>
  [...page.matchAll(/href="(https:\/\/wa\.me\/\d+\?text=[^"]+)"/g)]
    .map((match) => decodeURIComponent(match[1] ?? ''))
    .find((link) => link.includes('Bota Andes')) ?? '';

describe('detalle: botón de WhatsApp', () => {
  it('con talla elegida arma el mensaje con producto, talla, color, código y referencia', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro', 'live-nov');

    expect(page).toContain('Consultar por WhatsApp');
    const link = productLink(page);
    expect(link).toContain('Bota Andes');
    expect(link).toContain('Talla: 38');
    expect(link).toContain('Color: Negro');
    expect(link).toContain('Código: BOT-38-NEG');
    expect(link).toContain('Ref: live-nov');
  });

  it('sin talla pide elegirla: el botón lleva al selector y no abre WhatsApp', async () => {
    world(detail());

    const page = await html();

    expect(page).toContain('Elige tu talla');
    expect(page).toContain('href="#talla"');
    expect(page).not.toContain('Consultar por WhatsApp');
  });
});

describe('product-page (2)', () => {
  it('una talla agotada en la URL no habilita el botón', async () => {
    world(detail());

    expect(await html('?talla=40&color=Negro')).not.toContain('Consultar por WhatsApp');
  });

  it('con todo agotado ofrece preguntar cuándo vuelve, sin talla', async () => {
    const variants = detail().variants.map((variant) => ({
      ...variant,
      availability: 'out' as const,
    }));
    world(detail({ availability: 'out', variants }));

    const page = await html();

    expect(page).toContain('Preguntar cuándo vuelve');
    expect(
      decodeURIComponent(
        /wa\.me\/\d+\?text=([^"]+)"[^>]*>\s*<svg[^>]*>.*?Preguntar/s.exec(page)?.[1] ?? ''
      )
    ).not.toContain('Talla:');
  });
});

describe('product-page (3)', () => {
  it('sin número de WhatsApp en la configuración no hay botón ni barra fija', async () => {
    world(detail(), '');

    const page = await html('?talla=38&color=Negro');

    expect(page).not.toContain('Consultar por WhatsApp');
    expect(page).not.toContain('fixed inset-x-0 bottom-0');
  });

  it('en teléfono hay una barra fija inferior con el botón', async () => {
    world(detail());

    expect(await html('?talla=38&color=Negro')).toContain('fixed inset-x-0 bottom-0 z-20');
  });
});
