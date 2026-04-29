'use client';

import { useSyncSession } from '@src/shared/hooks/useSyncSession';

function SessionSync() {
  useSyncSession();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SessionSync />
      {children}
    </>
  );
}
