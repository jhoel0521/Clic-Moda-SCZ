import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de Next.js para protección de rutas.
 *
 * Rutas protegidas:
 * - /admin/*  → requiere usuario autenticado con rol de admin
 * - /perfil   → requiere usuario autenticado (cualquier rol)
 *
 * En el Backend Simulado, la sesión se verifica mediante la cookie
 * 'clic-moda-auth' que persiste Zustand (localStorage → cookie en SSR).
 *
 * NOTA: localStorage no está disponible en el middleware (se ejecuta en Edge).
 * La implementación real en Sprint 3 leerá un JWT de cookie httpOnly.
 * Por ahora, se verifica la existencia de la cookie de sesión simulada.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si hay una cookie de sesión (Zustand la escribe en localStorage,
  // aquí verificamos la versión de cookie que configuraremos en Sprint 3)
  const sessionCookie = request.cookies.get('clic-moda-session');
  const isAuthenticated = !!sessionCookie?.value;

  // Proteger rutas de administración
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('reason', 'auth_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteger perfil del cliente
  if (pathname.startsWith('/perfil')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

/** Matcher: aplica el middleware solo a las rutas relevantes */
export const config = {
  matcher: ['/admin/:path*', '/perfil/:path*'],
};
