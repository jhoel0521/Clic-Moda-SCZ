'use client';

import { useAuthStore } from '@src/core/store/useAuthStore';
import { RequireAuth } from '@src/core/guards/RequireAuth';
import { ADMIN_ROLES } from '@src/core/constants/ROLES';
import { AdminSidebar } from './AdminSidebar';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated && user && !ADMIN_ROLES.includes(user.role as typeof ADMIN_ROLES[number])) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-4xl mb-4">🚫</p>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">Acceso denegado</h1>
          <p className="text-[var(--color-text-muted)]">No tenés permisos para acceder al panel de administración.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth redirectTo="/login?redirect=/admin">
      <AdminGuard>
        <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <main className="flex-1 p-6 overflow-auto">{children}</main>
          </div>
        </div>
      </AdminGuard>
    </RequireAuth>
  );
}
