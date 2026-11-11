import { catalog } from '../lib/catalog';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FALLBACK_SETTINGS, settingsStore, type StoreSettings } from '../lib/settings';
import { card, page, stubApi } from '../test/api-stub';
import Contacto from './contacto.astro';
import Index from './index.astro';

const LOGO = '0a1b2c3d-0000-4000-8000-000000000001';

const withApi = (over: Partial<StoreSettings> = {}) => {
  const settings: StoreSettings = {
    ...FALLBACK_SETTINGS,
    brandName: 'Verashoe',
    color: {
      primary: '#2d5b8a',
      dark: '#1f4064',
      light: '#5a86b3',
      soft: '#eaf0f6',
      onPrimary: '#ffffff',
    },
    contact: {
      whatsapp: '59171234567',
      address: 'Av. Banzer 123',
      pickupHours: 'Lun a sáb 9 a 18',
      mapUrl: 'https://maps.app.goo.gl/x',
    },
    ...over,
  };
  stubApi({ settings, list: page([card()]) });
};

const render = async (page: typeof Index) => (await AstroContainer.create()).renderToString(page);

beforeEach(() => {
  settingsStore.reset();
  catalog.reset();
});
afterEach(() => vi.unstubAllGlobals());

describe('inicio: marca desde la configuración', () => {
  it('pinta el nombre, el idioma es-BO y los colores de la marca como variables CSS', async () => {
    withApi();

    const html = await render(Index);

    expect(html).toContain('lang="es-BO"');
    expect(html).toContain('<h1');
    expect(html).toContain('Verashoe');
    expect(html).toContain('--brand:#2d5b8a');
    expect(html).toContain('name="theme-color" content="#2d5b8a"');
  });

  it('sin logo muestra el nombre como texto y con logo muestra la imagen de la tienda', async () => {
    withApi();
    expect(await render(Index)).toContain('truncate text-lg font-bold');

    settingsStore.reset();
    withApi({ logo: { mediaId: LOGO, path: `/m/${LOGO}/logo-2.webp`, alt: 'Logo' } });
    const html = await render(Index);

    expect(html).toContain(`src="/m/${LOGO}/logo-2.webp"`);
    expect(html).toContain('alt="Verashoe"');
  });
});

describe('inicio: nombres peligrosos', () => {
  it('un nombre con HTML no inyecta etiquetas ni se sale de un atributo', async () => {
    withApi({ brandName: '"><script>alert(1)</script>' });

    const html = await render(Index);

    // Las comillas se escapan: nada se sale del atributo (un `<` dentro de comillas es inerte).
    expect(html).not.toContain('"><script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('content="&quot;><script>');
  });
});

describe('inicio: SEO y compartir', () => {
  it('el HTML del servidor trae título, canonical y etiquetas de compartir con la tienda', async () => {
    withApi();

    const html = await render(Index);

    expect(html).toContain(
      '<title>Clic Moda SC · Calzado de moda en Santa Cruz · Verashoe</title>'
    );
    expect(html).toContain('property="og:site_name" content="Verashoe"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('rel="canonical"');
  });
});

describe('inicio: imagen de compartir', () => {
  it('usa la imagen de compartir de la configuración en og:image', async () => {
    const shareImage = {
      mediaId: LOGO,
      path: `/m/${LOGO}/link-1.jpg`,
      alt: 'Fachada',
      width: 1200,
      height: 630,
      type: 'image/jpeg',
    };
    withApi({ seo: { ...FALLBACK_SETTINGS.seo, shareImage } });

    const html = await render(Index);

    expect(html).toContain(`/m/${LOGO}/link-1.jpg"`);
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
  });
});

describe('WhatsApp y respaldo', () => {
  it('el botón abre wa.me con el número de la configuración y no hay números literales', async () => {
    withApi();

    const html = await render(Index);

    expect(html).toContain('https://wa.me/59171234567?text=');
  });
});

describe('WhatsApp ausente y API caída', () => {
  it('sin número válido no se ofrece el botón', async () => {
    withApi({ contact: { ...FALLBACK_SETTINGS.contact, whatsapp: '' } });

    expect(await render(Index)).not.toContain('wa.me');
  });

  it('si la API no responde se ve la marca provisional en vez de un error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('API caída')))
    );

    const html = await render(Index);

    expect(html).toContain('Clic Moda SC');
  });
});

describe('redes sociales', () => {
  it('cada red del pie lleva su ícono en línea y su nombre', async () => {
    const social = {
      instagram: 'https://www.instagram.com/x',
      tiktok: 'https://www.tiktok.com/@x',
      facebook: 'https://www.facebook.com/x',
    };
    withApi({ social });

    const html = await render(Index);

    // WhatsApp y Contacto también llevan ícono: 3 redes + WhatsApp (cabecera y pie) + Contacto.
    expect(html.match(/<svg[^>]*aria-hidden="true"/g)?.length).toBe(6);
    for (const name of ['Instagram', 'TikTok', 'Facebook']) expect(html).toContain(name);
  });
});

describe('accesibilidad de la estructura', () => {
  it('ofrece "Saltar al contenido" y el contenido principal tiene su ancla', async () => {
    withApi();

    const html = await render(Index);

    expect(html).toContain('href="#contenido"');
    expect(html).toContain('id="contenido"');
    expect(html).toContain('<main');
    expect(html).toContain('aria-label="Principal"');
  });
});

describe('contacto', () => {
  it('muestra WhatsApp, almacén, horario y mapa de la configuración', async () => {
    withApi();

    const html = await render(Contacto);

    expect(html).toContain('<iframe');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('output=embed');
    for (const text of [
      'Av. Banzer 123',
      'Lun a sáb 9 a 18',
      'https://maps.app.goo.gl/x',
      'Escribir por WhatsApp',
    ]) {
      expect(html).toContain(text);
    }
  });
});
