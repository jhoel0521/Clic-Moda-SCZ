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
  it('talla y color son grupos con título; las agotadas no se muestran si hay otras disponibles', async () => {
    world(detail());

    const page = await html();

    expect(page).toContain('<legend class="mb-1 font-semibold">Talla</legend>');
    expect(page).toMatch(/value="39"/);
    expect(page).not.toMatch(/value="40"/);
    expect(page).toContain('Últimas');
  });
});

describe('detalle: un solo color disponible', () => {
  it('si el grupo de color se oculta, el color elegido viaja en el formulario', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro');

    expect(page).not.toContain('<legend class="mb-1 font-semibold">Color</legend>');
    expect(page).toMatch(/<input[^>]*type="hidden"[^>]*name="color"[^>]*value="Negro"/);
  });
});

describe('detalle: todo agotado', () => {
  it('con todo agotado las tallas se ven desactivadas y se puede preguntar cuándo vuelve', async () => {
    const variants = detail().variants.map((variant) => ({
      ...variant,
      availability: 'out' as const,
    }));
    world(detail({ availability: 'out', variants }));

    const page = await html();

    expect(page).toMatch(/value="40"[^>]*disabled/);
    expect(page).toContain('Agotada');
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
    expect(page).not.toContain('fixed inset-x-0 bottom-0 z-20');
  });

  it('en teléfono la barra del botón va encima de la barra de navegación, que sigue visible', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro');

    expect(page).toContain('bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30');
    expect(page).toContain('aria-label="Navegación inferior"');
  });
});

describe('detalle: coherencia con la tarjeta', () => {
  it('las opciones son píldoras redondas del mismo estilo y ninguna lleva texto de estado dentro', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro');
    const picker = page.slice(page.indexOf('data-variant-form'), page.indexOf('type="submit"'));

    expect(picker).toContain('rounded-full');
    expect(picker).toContain('has-[:checked]:bg-brand-dark');
    expect(picker).not.toContain('rounded-xl border-2');
    expect(picker).not.toMatch(/<span class="text-xs font-medium text-warning">/);
  });

  it('"Últimas unidades" es un punto con leyenda, no texto dentro de la opción', async () => {
    world(detail());

    const picker = (await html('?talla=38&color=Negro')).split('data-variant-form')[1] ?? '';

    expect(picker).toContain('bg-warning ring-2 ring-white');
    expect(picker).toContain('<span class="sr-only">, últimas unidades</span>');
    expect(picker).toMatch(/Últimas unidades\s*<\/p>/);
  });
});

describe('detalle: disponibilidad de la variante elegida', () => {
  it('la disponibilidad que se ve es la de la variante elegida y va en el bloque que se actualiza', async () => {
    world(detail());

    const block = (await html('?talla=39&color=Negro')).split('data-live="price"')[1] ?? '';

    expect(block.slice(0, block.indexOf('data-variant-form'))).toContain('Últimas unidades');
    expect((await html('?talla=38&color=Negro')).split('data-live="price"')[1]).toContain(
      'Disponible'
    );
  });
});

const mixedPrices = (): Product =>
  detail({
    price: '305.00',
    priceVaries: true,
    variants: [
      { size: '36', color: 'Rojo', sku: 'SAN-36-ROJ', price: '305.00', availability: 'in_stock' },
      { size: '37', color: 'Rojo', sku: 'SAN-37-ROJ', price: '350.00', availability: 'in_stock' },
    ],
  });

describe('detalle: precio por variante', () => {
  it('sin elegir dice "Desde" y pide elegir; cada talla muestra su precio', async () => {
    world(mixedPrices());

    const page = await html();

    expect(page).toContain('Desde Bs 305,00');
    expect(page).toContain('Elige talla y color para ver su precio');
    expect(page).toContain('Bs 350,00');
  });

  it('con la talla elegida muestra su precio, dice cuál es y lo manda por WhatsApp', async () => {
    world(mixedPrices());

    const page = await html('?talla=37&color=Rojo');

    expect(page).toContain('Talla 37 · Rojo');
    expect(page).not.toContain('Desde Bs 305,00');
    expect(productLink(page)).toContain('Precio: Bs 350,00');
  });

  it('con un solo precio aclara que vale para todas las tallas y colores', async () => {
    world(detail());

    expect(await html()).toContain('El mismo precio en todas las tallas y colores');
  });
});

describe('detalle: qué pasa tras tocar el botón', () => {
  it('explica el final del flujo para todos los anchos, no solo en escritorio', async () => {
    world(detail());

    const page = await html('?talla=38&color=Negro');
    const note = page.slice(page.indexOf('Se abre el chat de WhatsApp'));

    expect(note.slice(0, 260)).toContain('coordinamos el pago y la entrega');
    expect(page.slice(page.lastIndexOf('<p', page.indexOf('Se abre el chat')))).not.toMatch(
      /^<p class="hidden/
    );
  });

  it('sin número de WhatsApp no promete un chat', async () => {
    world(detail(), '');

    expect(await html('?talla=38&color=Negro')).not.toContain('Se abre el chat de WhatsApp');
  });
});
