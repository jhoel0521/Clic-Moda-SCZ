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
 *
 * Espera a que:
 * 1. Zustand termine de hidratar del localStorage (_hasHydrated)
 * 2. La sesión se valide contra el servidor (_hasValidatedWithServer)
 * 3. El usuario esté autenticado (isAuthenticated)
 *
 * Complementa el middleware.ts que protege en el servidor.
 */
export function RequireAuth({ children, redirectTo = ROUTES.LOGIN }: RequireAuthProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const hasValidatedWithServer = useAuthStore((s) => s._hasValidatedWithServer);

  useEffect(() => {
    // Ambas validaciones completadas: si no está autenticado, redirigir
    if (hasHydrated && hasValidatedWithServer && !isAuthenticated) {
      router.replace(redirectTo);
    }
  }, [hasHydrated, hasValidatedWithServer, isAuthenticated, redirectTo, router]);

  // Mostrar loading mientras se valida
  if (!hasHydrated || !hasValidatedWithServer || !isAuthenticated) {
    return <PageSpinner label="Verificando sesión..." />;
  }

  return <>{children}</>;
}
