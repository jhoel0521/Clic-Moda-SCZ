import { afterEach, expect, it, vi } from 'vitest';
import { SESSION_COOKIE } from '../../lib/session';
import { POST as login } from './login';
import { POST as forward } from './[...path]';

afterEach(() => vi.unstubAllGlobals());

const stubApi = (status: number, body: unknown) => {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify(body), { status }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const loginRequest = () =>
  new Request('http://panel.test/api/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'a@b.c', password: 'x' }),
  });

const cookieJar = () => {
  const set = vi.fn();
  return { set, jar: { set } };
};

type Handler = (context: never) => Promise<Response>;

it('Login — con credenciales válidas guarda el token en una cookie httpOnly y no lo devuelve', async () => {
  stubApi(200, {
    accessToken: 'jwt-secreto',
    expiresInSeconds: 900,
    user: { id: 'u', email: 'a@b.c', name: 'Ana', roles: ['GERENTE'] },
  });
  const { set, jar } = cookieJar();

  const res = await (login as Handler)({ request: loginRequest(), cookies: jar } as never);

  expect(set).toHaveBeenCalledWith(
    SESSION_COOKIE,
    expect.any(String),
    expect.objectContaining({ httpOnly: true, sameSite: 'lax' })
  );
  expect(JSON.stringify(await res.json())).not.toContain('jwt-secreto');
});

it('Login — con credenciales inválidas responde el error y no crea cookie', async () => {
  stubApi(401, { message: 'Credenciales inválidas' });
  const { set, jar } = cookieJar();

  const res = await (login as Handler)({ request: loginRequest(), cookies: jar } as never);

  expect(res.status).toBe(401);
  expect(set).not.toHaveBeenCalled();
});

const proxied = (
  path: string,
  extra: Record<string, unknown> = {},
  init: RequestInit = { method: 'POST', body: '{}' }
) =>
  (forward as Handler)({
    params: { path },
    request: new Request(`http://panel.test/api/${path}`, init),
    locals: { session: { token: 'jwt-de-sesion' } },
    ...extra,
  } as never);

it('Proxy — reenvía a la API con el token de la sesión y la clave de idempotencia', async () => {
  const fetchMock = stubApi(202, { id: 'cmd1' });

  await proxied('inventory/commands', {}, { method: 'POST', body: '{}', headers: { 'Idempotency-Key': 'adm-123' } });

  const [, init] = fetchMock.mock.calls[0] as unknown as [string, { headers: Record<string, string> }];
  expect(init.headers.Authorization).toBe('Bearer jwt-de-sesion');
  expect(init.headers['Idempotency-Key']).toBe('adm-123');
});

it('Proxy — rechaza rutas de la API que el panel no expone', async () => {
  const fetchMock = stubApi(200, {});

  const res = await proxied('identity/users');

  expect(res.status).toBe(404);
  expect(fetchMock).not.toHaveBeenCalled();
});

const stubBinary = (status: number, body: BodyInit | null, headers: Record<string, string> = {}) => {
  const fetchMock = vi.fn(async () => new Response(body, { status, headers }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

it('Imágenes — reenvía la subida multipart con su tipo y el token, sin reinterpretarla', async () => {
  const fetchMock = stubBinary(201, JSON.stringify({ id: 'm1' }), { 'content-type': 'application/json' });
  const type = 'multipart/form-data; boundary=xyz';

  const res = await proxied('media', {}, { method: 'POST', body: 'cuerpo-binario', headers: { 'Content-Type': type } });

  const [url, init] = fetchMock.mock.calls[0] as unknown as [
    string,
    { headers: Record<string, string>; body: ArrayBuffer },
  ];
  expect([url.endsWith('/media'), init.headers.Authorization, init.headers['content-type']]).toEqual([
    true,
    'Bearer jwt-de-sesion',
    type,
  ]);
  expect(new TextDecoder().decode(init.body)).toBe('cuerpo-binario');
  expect(res.status).toBe(201);
});

it('Imágenes — devuelve los bytes y las cabeceras de caché tal cual', async () => {
  stubBinary(200, new Uint8Array([1, 2, 3]), {
    'content-type': 'image/jpeg',
    'cache-control': 'public, immutable',
    etag: '"e"',
  });

  const res = await proxied('public/media/abc/link-1.jpg', {}, { method: 'GET' });

  expect([res.headers.get('content-type'), res.headers.get('etag')]).toEqual(['image/jpeg', '"e"']);
  expect(new Uint8Array(await res.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3]));
});

it('Imágenes — un borrado responde 204 sin cuerpo y no se exponen otras rutas con prefijo parecido', async () => {
  stubBinary(204, null);

  expect((await proxied('media/abc', {}, { method: 'DELETE' })).status).toBe(204);
  expect((await proxied('mediaextra')).status).toBe(404);
});
