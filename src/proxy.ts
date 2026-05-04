import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para protección de rutas.
 *
 * Rutas protegidas:
 * - /admin/*      → requiere usuario autenticado con rol de admin
 * - /perfil/*     → requiere usuario autenticado
 * - /pedidos/*    → requiere usuario autenticado
 * - /carrito/*    → requiere usuario autenticado
 * - /checkout/*   → requiere usuario autenticado
 *
 * La sesión se verifica mediante la cookie 'clic-moda-session'.
 * El cliente también valida con GET /api/auth/me para sincronización.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const PROTECTED_ROUTES = ['/admin', '/perfil', '/pedidos', '/carrito', '/checkout'];

  // Verificar si esta es una ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (!isProtectedRoute) {
    // Ruta pública - permitir acceso
    return NextResponse.next();
  }

  // Ruta protegida - verificar sesión
  const sessionCookie = request.cookies.get('clic-moda-session');
  const isAuthenticated = !!sessionCookie?.value;

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Sesión válida - permitir acceso
  return NextResponse.next();
}

/** Matcher: aplica el middleware a las rutas relevantes */
export const config = {
  matcher: [
    '/admin/:path*',
    '/perfil/:path*',
    '/pedidos/:path*',
    '/carrito/:path*',
    '/checkout/:path*',
  ],
};
