'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@src/core/store/useAuthStore';

/** DEMO: la sesión vive solo en el navegador; basta con esperar a que Zustand hidrate. */
export function useAuthHydration() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const setHasValidatedWithServer = useAuthStore((s) => s.setHasValidatedWithServer);

  useEffect(() => {
    if (hasHydrated) setHasValidatedWithServer(true);
  }, [hasHydrated, setHasValidatedWithServer]);
}
