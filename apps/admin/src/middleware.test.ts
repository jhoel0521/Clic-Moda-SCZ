import { expect, it, vi } from 'vitest';
import { encodeSession, SESSION_COOKIE } from './lib/session';

vi.mock('astro:middleware', () => ({ defineMiddleware: (fn: unknown) => fn }));

const { onRequest } = await import('./middleware');

const next = vi.fn(async () => new Response('ok'));
const redirect = vi.fn((to: string) => new Response(null, { status: 302, headers: { Location: to } }));

function run(path: string, cookie?: string) {
  const context = {
    url: new URL(`http://panel.test${path}`),
    cookies: { get: () => (cookie ? { value: cookie } : undefined) },
    locals: {} as Record<string, unknown>,
    redirect,
  };
  return (onRequest as unknown as (c: typeof context, n: typeof next) => Promise<Response>)(context, next);
}

const valid = encodeSession({
  token: 'jwt',
  user: { id: 'u', email: 'a@b.c', name: 'Ana', roles: ['GERENTE'] },
  expiresAt: Date.now() + 60_000,
});

it('protección de pantallas — sin sesión redirige al inicio de sesión con el destino', async () => {
  const res = await run('/productos?x=1');

  expect(res.headers.get('Location')).toBe('/login?next=%2Fproductos%3Fx%3D1');
});

it('protección de pantallas — sin sesión las rutas /api responden 401 en JSON', async () => {
  const res = await run('/api/catalog/products');

  expect(res.status).toBe(401);
  expect(await res.json()).toEqual({ message: 'Se requiere iniciar sesión' });
});

it('protección de pantallas — la pantalla de login y su ruta son públicas', async () => {
  next.mockClear();
  await run('/login');
  await run('/api/login');

  expect(next).toHaveBeenCalledTimes(2);
});

it('protección de pantallas — con sesión vigente deja pasar', async () => {
  next.mockClear();
  await run('/productos', valid);

  expect(next).toHaveBeenCalledTimes(1);
});

it('el nombre de la cookie es el esperado', () => {
  expect(SESSION_COOKIE).toBe('clic_admin_session');
});
