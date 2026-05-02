/**
 * Roles disponibles en el sistema Clic Moda SCZ.
 * Gerente: acceso total al backoffice.
 * Despacho: gestión de pedidos y envíos.
 * AtencionCliente: moderación de reseñas y soporte.
 * Cliente: comprador registrado.
 */
export const ROLES = {
  GERENTE: 'GERENTE',
  DESPACHO: 'DESPACHO',
  ATENCION_CLIENTE: 'ATENCION_CLIENTE',
  CLIENTE: 'CLIENTE',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** Roles que tienen acceso al panel de administración */
export const ADMIN_ROLES: UserRole[] = [ROLES.GERENTE, ROLES.DESPACHO, ROLES.ATENCION_CLIENTE];
