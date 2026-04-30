'use client';

import { useSyncSession } from '@src/shared/hooks/useSyncSession';
import { Toast } from '@src/shared/ui/feedback/Toast';

function SessionSync() {
  useSyncSession();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionSync />
      {children}
      <Toast />
    </>
  );
}
