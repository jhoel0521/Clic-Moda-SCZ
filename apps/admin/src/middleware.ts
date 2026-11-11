import { defineMiddleware } from 'astro:middleware';
import { readSession, SESSION_COOKIE } from './lib/session';

const PUBLIC_PATHS = ['/login', '/api/login', '/favicon.svg'];
const isPublic = (path: string): boolean => PUBLIC_PATHS.includes(path) || path.startsWith('/_');

// Exige sesión en todo el panel. Las pantallas redirigen al inicio de sesión (con el destino) y las
// rutas /api/* responden 401 en JSON.
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  const session = readSession(context.cookies.get(SESSION_COOKIE)?.value);
  context.locals.session = session;
  if (session || isPublic(pathname)) return next();
  if (pathname.startsWith('/api/')) {
    return Response.json({ message: 'Se requiere iniciar sesión' }, { status: 401 });
  }
  return context.redirect(`/login?next=${encodeURIComponent(pathname + search)}`);
});
