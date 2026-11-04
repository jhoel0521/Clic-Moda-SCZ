'use client';

import { useAuthStore } from '@src/core/store/useAuthStore';
import { RequireAuth } from '@src/core/guards/RequireAuth';
import { ADMIN_ROLES } from '@src/core/constants/ROLES';
import { AdminSidebar, AdminMobileNav } from './AdminSidebar';

function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated && user && !ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number])) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-text-primary mb-2 text-xl font-bold">Acceso denegado</h1>
          <p className="text-text-muted">
            No tenés permisos para acceder al panel de administración.
          </p>
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
        <div className="bg-bg-secondary flex min-h-dvh">
          <AdminSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="safe-top page-with-nav flex-1 p-4 md:p-6 md:pb-6">{children}</main>
          </div>
          <AdminMobileNav />
        </div>
      </AdminGuard>
    </RequireAuth>
  );
}
