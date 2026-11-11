import type { APIRoute } from 'astro';
import { callApi } from '../../lib/api-server';
import { encodeSession, SESSION_COOKIE, type SessionUser } from '../../lib/session';

interface LoginBody {
  accessToken: string;
  expiresInSeconds: number;
  user: SessionUser;
}

// Inicia sesión contra la API y guarda el token en una cookie httpOnly (nunca llega al JavaScript).
export const POST: APIRoute = async ({ request, cookies }) => {
  const credentials = await request.json().catch(() => null);
  const result = await callApi('/auth/login', { method: 'POST', body: credentials });
  if (result.status !== 200) {
    return Response.json(result.body ?? { message: 'No se pudo iniciar sesión' }, {
      status: result.status,
    });
  }
  const login = result.body as LoginBody;
  const expiresAt = Date.now() + login.expiresInSeconds * 1000;
  cookies.set(SESSION_COOKIE, encodeSession({ token: login.accessToken, user: login.user, expiresAt }), {
    httpOnly: true,
    sameSite: 'lax',
    // Secure en producción; ADMIN_INSECURE_COOKIES=1 solo para probar el build por HTTP en local.
    secure: import.meta.env.PROD && process.env.ADMIN_INSECURE_COOKIES !== '1',
    path: '/',
    maxAge: login.expiresInSeconds,
  });
  return Response.json({ user: login.user });
};
