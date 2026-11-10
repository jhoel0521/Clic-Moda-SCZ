'use client';

import { useSyncSession } from '@src/shared/hooks/useSyncSession';
import { useAuthHydration } from '@src/shared/hooks/useAuthHydration';
import { Toast } from '@src/shared/ui/feedback/Toast';

function SessionSync() {
  useSyncSession();
  return null;
}

function AuthValidator() {
  // Este hook valida la sesión contra el servidor mientras se hidrata
  useAuthHydration();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionSync />
      <AuthValidator />
      {children}
      <Toast />
    </>
  );
}
