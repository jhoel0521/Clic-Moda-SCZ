/**
 * Constantes de rutas de la aplicación.
 * En Next.js App Router el enrutamiento es por sistema de archivos;
 * este módulo centraliza las URLs para evitar strings mágicos en todo el código.
 *
 * Equivalente al AppRouter.tsx del README — adaptado a Next.js.
 */

export const ROUTES = {
  HOME: '/',

  // Tienda pública
  CATALOG: '/catalogo',
  PRODUCT: (slug: string) => `/producto/${slug}`,
  CART: '/carrito',
  CHECKOUT: '/checkout',
  CHECKOUT_CONFIRMATION: '/checkout/confirmacion',

  // Autenticación
  LOGIN: '/login',

  // Cliente autenticado
  PROFILE: '/perfil',

  // Panel de administración
  ADMIN: {
    DASHBOARD: '/admin',
    PRODUCTS: '/admin/productos',
    ORDERS: '/admin/pedidos',
    MARKETING: '/admin/marketing',
  },
} as const;

/** Rutas que requieren autenticación (cualquier rol) */
export const PROTECTED_ROUTES = [ROUTES.PROFILE] as const;

/** Rutas que requieren un rol de administrador */
export const ADMIN_ROUTES = [
  ROUTES.ADMIN.DASHBOARD,
  ROUTES.ADMIN.PRODUCTS,
  ROUTES.ADMIN.ORDERS,
  ROUTES.ADMIN.MARKETING,
] as const;
