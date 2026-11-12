import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { catalog } from '../lib/catalog';
import { FALLBACK_SETTINGS, settingsStore, type StoreSettings } from '../lib/settings';
import { card, detail, page, stubApi } from '../test/api-stub';
import Catalogo from './catalogo.astro';
import Contacto from './contacto.astro';
import Index from './index.astro';
import Producto from './p/[slug].astro';

const settings: StoreSettings = {
  ...FALLBACK_SETTINGS,
  contact: {
    whatsapp: '59171234567',
    address: 'Av. Banzer 123',
    pickupHours: 'Lun a sáb 9 a 18',
    mapUrl: null,
  },
};

beforeEach(() => {
  settingsStore.reset();
  catalog.reset();
  stubApi({ settings, list: page([card()]), product: detail() });
});
afterEach(() => vi.unstubAllGlobals());

const footerOf = async (component: unknown, params?: Record<string, string>): Promise<string> => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(component as typeof Index, {
    params,
    request: new Request('https://tienda.test/'),
    locals: { ref: null },
  });
  return html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
};

describe('pie: una sola superficie sin repetir', () => {
  it('muestra WhatsApp una sola vez y la línea de privacidad', async () => {
    const footer = await footerOf(Index);

    expect(footer.match(/wa\.me/g)).toHaveLength(1);
    expect(footer).toContain('No guardamos datos personales.');
  });

  it('no repite la banda de WhatsApp ni los pasos de compra (eso es de la portada)', async () => {
    const footer = await footerOf(Catalogo);

    expect(footer).not.toContain('¿Quieres reservar tu talla?');
    expect(footer).not.toContain('Cómo comprar');
  });

  it('el pie es un solo bloque oscuro, sin franjas de otro tono apiladas', async () => {
    const footer = await footerOf(Index);

    expect(footer).toContain('bg-neutral-950');
    expect(footer).not.toContain('bg-neutral-900');
    expect(footer).not.toContain('bg-black');
  });
});

describe('pie: según la página', () => {
  it('en el contacto no repite dirección, horario ni WhatsApp (la página ya los trae)', async () => {
    const footer = await footerOf(Contacto);

    expect(footer).not.toContain('Av. Banzer 123');
    expect(footer).not.toContain('Recojo:');
    expect(footer).not.toContain('wa.me');
    expect(footer).toContain('No guardamos datos personales.');
  });

  it('en la ficha del producto reserva el espacio de las dos barras fijas', async () => {
    const footer = await footerOf(Producto, { slug: 'bota-andes' });

    expect(footer).toContain('pb-[calc(9.5rem+env(safe-area-inset-bottom))]');
  });

  it('en el resto reserva solo la barra de navegación', async () => {
    expect(await footerOf(Index)).toContain('pb-[calc(4.5rem+env(safe-area-inset-bottom))]');
  });
});

describe('portada: cómo comprar', () => {
  it('cierra con los pasos de compra y el botón de WhatsApp', async () => {
    const container = await AstroContainer.create();

    const html = await container.renderToString(Index);

    expect(html).toContain('id="como-comprar"');
    expect(html).toContain('Elige tu modelo, talla y color.');
  });
});
