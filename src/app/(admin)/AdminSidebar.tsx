'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShirtIcon, Package, Megaphone, LogOut, Store } from 'lucide-react';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { AuthService } from '@src/services/AuthService';
import { ROUTES } from '@src/routes';

const ROLE_LABELS: Record<string, string> = {
  GERENTE: 'Gerente',
  DESPACHO: 'Despacho',
  ATENCION_CLIENTE: 'Atención al Cliente',
  CLIENTE: 'Cliente',
};

const NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Productos', href: ROUTES.ADMIN.PRODUCTS, icon: ShirtIcon },
  { label: 'Pedidos', href: ROUTES.ADMIN.ORDERS, icon: Package },
  { label: 'Marketing', href: ROUTES.ADMIN.MARKETING, icon: Megaphone },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await AuthService.logout();
    logout();
    router.push(ROUTES.LOGIN);
  }

  return (
    <aside className="w-64 border-r border-border bg-surface flex flex-col shrink-0">
      {/* Marca */}
      <div className="px-5 py-5 border-b border-border">
        <p className="font-black text-lg tracking-tight text-brand">Clic Moda SCZ</p>
        <p className="text-xs text-text-muted mt-0.5">Panel de administración</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== ROUTES.ADMIN.DASHBOARD && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-subtle text-brand'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
              ].join(' ')}
            >
              <Icon size={17} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer con usuario */}
      <div className="p-4 border-t border-border space-y-3">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-2 px-3 py-2 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <Store size={15} />
          Ver tienda
        </Link>
        {user && (
          <div className="flex items-center justify-between gap-2 px-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-text-primary truncate">{user.name}</p>
              <p className="text-xs text-brand font-medium">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 text-text-muted hover:text-danger transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
