import { beforeEach, describe, expect, it, vi } from 'vitest';
import { forgetMaps, mapEmbedUrl } from './maps';

const LONG =
  'https://maps.google.com/?q=C.+9+5333,+Santa+Cruz+de+la+Sierra,+Bolivia&ftid=0x93f1c29354d9b92f:0x9fee99b491c942dd';
const SHORT = 'https://maps.app.goo.gl/4ApYoH4jQzkh12re8';
const redirectTo = (location: string) =>
  vi.fn(() => Promise.resolve(new Response(null, { status: 302, headers: { location } })));

beforeEach(forgetMaps);

describe('mapEmbedUrl: enlaces de Google', () => {
  it('usa tal cual una URL de "Insertar un mapa"', async () => {
    const embed = 'https://www.google.com/maps/embed?pb=!1m18!1m12';

    expect(await mapEmbedUrl(embed, 'Av. Banzer 123')).toBe(embed);
  });

  it('un enlace largo con q= muestra ese mismo lugar', async () => {
    const fetcher = vi.fn();

    const url = await mapEmbedUrl(LONG, 'otra dirección', fetcher);

    expect(url).toBe(
      'https://www.google.com/maps?q=C.%209%205333%2C%20Santa%20Cruz%20de%20la%20Sierra%2C%20Bolivia&output=embed'
    );
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('un enlace /maps/place/<nombre> usa el nombre del lugar', async () => {
    const url = await mapEmbedUrl(
      'https://www.google.com/maps/place/Zapater%C3%ADa+Clic/@-17.78,-63.18,17z',
      ''
    );

    expect(url).toContain('q=Zapater%C3%ADa%20Clic');
  });
});

describe('mapEmbedUrl: redirección real de Google', () => {
  it('un enlace corto que redirige a /maps/search/<coordenadas> muestra ese punto', async () => {
    const real =
      'https://www.google.com/maps/search/-17.781150,+-63.131378?entry=tts&g_ep=EgoyMDI2MTEwOS4wIPu8ASoASAFQAw%3D%3D';

    const url = await mapEmbedUrl(SHORT, 'Av. Banzer 123', redirectTo(real));

    expect(url).toBe('https://www.google.com/maps?q=-17.781150%2C%20-63.131378&output=embed');
  });
});

describe('mapEmbedUrl: enlace corto', () => {
  it('sigue la redirección en el servidor y muestra el lugar del enlace largo, no la dirección', async () => {
    const fetcher = redirectTo(LONG);

    const url = await mapEmbedUrl(SHORT, 'Av. Banzer 123', fetcher);

    expect(url).toContain('q=C.%209%205333');
    expect(fetcher).toHaveBeenCalledWith(SHORT, expect.objectContaining({ redirect: 'manual' }));
  });

  it('recuerda el resultado y no vuelve a consultar', async () => {
    const fetcher = redirectTo(LONG);

    await mapEmbedUrl(SHORT, '', fetcher);
    await mapEmbedUrl(SHORT, '', fetcher);

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('si la consulta falla cae a la dirección del almacén', async () => {
    const fetcher = vi.fn(() => Promise.reject(new Error('sin red')));

    expect(await mapEmbedUrl(SHORT, 'Av. Banzer 123', fetcher)).toContain('q=Av.%20Banzer%20123');
  });

  it('no sigue redirecciones hacia dominios que no son de Google', async () => {
    const url = await mapEmbedUrl(SHORT, '', redirectTo('https://evil.com/?q=x'));

    expect(url).toBeNull();
  });
});

describe('mapEmbedUrl: límites', () => {
  it('sin enlace usable ni dirección no hay mapa', async () => {
    expect(await mapEmbedUrl(null, '')).toBeNull();
    expect(
      await mapEmbedUrl('https://maps.app.goo.gl/abc', '  ', redirectTo('https://evil.com/'))
    ).toBeNull();
  });

  it('nunca incrusta otros dominios ni http', async () => {
    expect(await mapEmbedUrl('https://evil.com/maps/embed?x=1', '')).toBeNull();
    expect(await mapEmbedUrl('http://www.google.com/maps/embed?x=1', '')).toBeNull();
  });
});
