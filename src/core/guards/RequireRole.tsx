'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { ADMIN_ROLES, type UserRole } from '@src/core/constants/ROLES';
import { ROUTES } from '@src/routes';
import { PageSpinner } from '@src/shared/ui/Spinner';

interface RequireRoleProps {
  children: React.ReactNode;
  /** Roles permitidos. Si no se especifica, permite cualquier rol de admin. */
  roles?: UserRole[];
  /** Ruta a la que redirigir si el rol no es suficiente. Por defecto: / */
  redirectTo?: string;
}

/**
 * Guard de cliente: redirige si el usuario no tiene el rol requerido.
 * Usar dentro de RequireAuth (ya que asume que hay sesión activa).
 *
 * @example
 * <RequireRole roles={[ROLES.GERENTE]}>
 *   <GestionProductos />
 * </RequireRole>
 */
export function RequireRole({
  children,
  roles = ADMIN_ROLES,
  redirectTo = ROUTES.HOME,
}: RequireRoleProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);

  const hasRole = user !== null && roles.includes(user.role as UserRole);

  useEffect(() => {
    if (!isLoading && !hasRole) {
      router.replace(redirectTo);
    }
  }, [hasRole, isLoading, redirectTo, router]);

  if (isLoading || !hasRole) {
    return <PageSpinner label="Verificando permisos..." />;
  }

  return <>{children}</>;
}
