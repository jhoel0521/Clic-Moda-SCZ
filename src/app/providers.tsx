'use client';

/**
 * Providers wrapper para el App Router de Next.js.
 * Este Client Component envuelve la aplicación con todos los Context Providers necesarios.
 * Los stores de Zustand no necesitan un Provider propio (son singletons).
 * Este archivo existe para alojar futuros providers (ej: Toaster, QueryClient).
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
