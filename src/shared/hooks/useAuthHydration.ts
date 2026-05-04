'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@src/core/store/useAuthStore';

interface AuthHydrationState {
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Hook que sincroniza la hidratación de Zustand con validación en el servidor.
 *
 * Mientras Zustand carga el estado del localStorage, simultáneamente valida
 * la sesión contra el servidor. Si el servidor retorna 401, actualiza el estado
 * local incluso si el cliente tenía datos guardados.
 *
 * @returns { isLoading, isAuthenticated }
 */
export function useAuthHydration(): AuthHydrationState {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const setHasValidatedWithServer = useAuthStore((s) => s.setHasValidatedWithServer);
  const logout = useAuthStore((s) => s.logout);

  const [isValidatingServer, setIsValidatingServer] = useState(true);

  useEffect(() => {
    // Esperar a que Zustand termine de hidratar del localStorage
    if (!hasHydrated) {
      return;
    }

    // Si ya está hidratado, validar contra el servidor
    const validateSession = async () => {
      try {
        setIsValidatingServer(true);

        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Incluir cookies
        });

        if (response.ok) {
          // Sesión válida en servidor - mantener estado actual
          setIsValidatingServer(false);
          setHasValidatedWithServer(true);
        } else if (response.status === 401) {
          // Sesión inválida en servidor - limpiar estado local
          logout();
          setIsValidatingServer(false);
          setHasValidatedWithServer(true);
        } else {
          // Error del servidor - confiar en estado local por ahora
          setIsValidatingServer(false);
          setHasValidatedWithServer(true);
        }
      } catch (error) {
        // Network error - confiar en estado local
        console.warn('Error validating session:', error);
        setIsValidatingServer(false);
        setHasValidatedWithServer(true);
      }
    };

    validateSession();
  }, [hasHydrated, logout, setHasValidatedWithServer]);

  return {
    isLoading: !hasHydrated || isValidatingServer,
    isAuthenticated: hasHydrated && isAuthenticated && !isValidatingServer,
  };
}
