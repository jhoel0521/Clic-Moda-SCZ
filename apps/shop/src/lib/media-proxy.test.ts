import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../pages/m/[...path]';
import { isMediaPath, proxyMedia } from './media-proxy';

afterEach(() => vi.unstubAllGlobals());

const ID = '9f3a21b4-0c1d-4e5f-8a6b-7c8d9e0f1a2b';
const request = (headers: Record<string, string> = {}) =>
  new Request('http://tienda.test/m/x', { headers });

const stubApi = (response: Response) => {
  const fetchMock = vi.fn<typeof fetch>(async () => response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('isMediaPath', () => {
  it.each([`${ID}/link-3.jpg`, `${ID}/card-1.webp`])('acepta %s', (path) => {
    expect(isMediaPath(path)).toBe(true);
  });

  it.each([`${ID}/master.jpg`, `${ID}/link-1.png`, 'x/link-1.jpg', `${ID}/../link-1.jpg`, ''])(
    'rechaza %j',
    (path) => {
      expect(isMediaPath(path)).toBe(false);
    }
  );
});

describe('proxyMedia', () => {
  it('reenvía la imagen y las cabeceras de caché de la API', async () => {
    const headers = {
      'content-type': 'image/jpeg',
      'cache-control': 'public, max-age=31536000, immutable',
      etag: '"e"',
      'set-cookie': 'a=b',
    };
    const fetchMock = stubApi(new Response('bytes', { status: 200, headers }));

    const res = await proxyMedia(`${ID}/link-3.jpg`, request());

    expect(fetchMock).toHaveBeenCalledWith(`http://localhost:10010/public/media/${ID}/link-3.jpg`, {
      headers: {},
    });
    expect([res.status, res.headers.get('etag'), res.headers.get('cache-control')]).toEqual([
      200,
      '"e"',
      'public, max-age=31536000, immutable',
    ]);
    expect(res.headers.get('set-cookie')).toBeNull();
    expect(await res.text()).toBe('bytes');
  });
});

describe('proxyMedia: validadores', () => {
  it('pasa If-None-Match y devuelve 304 sin cuerpo', async () => {
    const fetchMock = stubApi(new Response(null, { status: 304, headers: { etag: '"e"' } }));

    const res = await proxyMedia(`${ID}/link-3.jpg`, request({ 'if-none-match': '"e"' }));

    expect(res.status).toBe(304);
    expect(fetchMock.mock.calls[0]?.[1]).toEqual({ headers: { 'If-None-Match': '"e"' } });
  });
});

describe('proxyMedia: lo que no se sirve', () => {
  it('no llama a la API con una ruta que no es de variante pública', async () => {
    const fetchMock = stubApi(new Response('x'));

    expect((await proxyMedia(`${ID}/master.jpg`, request())).status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('un error de la API se muestra como 404 sin detalles', async () => {
    stubApi(new Response('boom', { status: 500 }));

    expect((await proxyMedia(`${ID}/link-3.jpg`, request())).status).toBe(404);
  });

  it('si la API no responde devuelve 502', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Promise.reject(new Error('ECONNREFUSED')))
    );

    expect((await proxyMedia(`${ID}/link-3.jpg`, request())).status).toBe(502);
  });

  it('la ruta de Astro delega en el proxy', async () => {
    stubApi(new Response('ok', { status: 200 }));
    const context = { params: { path: `${ID}/link-1.jpg` }, request: request() } as never;

    expect((await GET(context)).status).toBe(200);
  });
});
