'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { ROUTES } from '@src/routes';
import { PageSpinner } from '@src/shared/ui/Spinner';

interface RequireAuthProps {
  children: React.ReactNode;
  /** Ruta a la que redirigir si no está autenticado. Por defecto: /login */
  redirectTo?: string;
}

/**
 * Guard de cliente: redirige a /login si el usuario no está autenticado.
 * Complementa el middleware.ts (que protege en el servidor).
 * Usar en layouts o páginas que requieran sesión activa.
 */
export function RequireAuth({ children, redirectTo = ROUTES.LOGIN }: RequireAuthProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  useEffect(() => {
    if (hasHydrated && !isLoading && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, isAuthenticated, isLoading, redirectTo, router]);

  if (!hasHydrated || isLoading || !isAuthenticated) {
    return <PageSpinner label="Verificando sesión..." />;
  }

  return <>{children}</>;
}
