'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Footprints, Package, Megaphone, LogOut, Store } from 'lucide-react';
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
  { label: 'Resumen', href: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
  { label: 'Productos', href: ROUTES.ADMIN.PRODUCTS, icon: Footprints },
  { label: 'Pedidos', href: ROUTES.ADMIN.ORDERS, icon: Package },
  { label: 'Marketing', href: ROUTES.ADMIN.MARKETING, icon: Megaphone },
];

function useIsActive() {
  const pathname = usePathname();
  return (href: string) =>
    href === ROUTES.ADMIN.DASHBOARD
      ? pathname === href || pathname === `${href}/`
      : pathname.startsWith(href);
}

/** Navegación inferior del panel en el teléfono. */
export function AdminMobileNav() {
  const isActive = useIsActive();

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? 'page' : undefined}
            className={`flex h-full flex-1 flex-col items-center justify-center gap-1 ${
              isActive(href) ? 'text-pink-600' : 'text-gray-500'
            }`}
          >
            <Icon size={22} />
            <span className="text-[11px] leading-none font-semibold">{label}</span>
          </Link>
        ))}
        <Link
          href={ROUTES.HOME}
          className="flex h-full flex-1 flex-col items-center justify-center gap-1 text-gray-500"
        >
          <Store size={22} />
          <span className="text-[11px] leading-none font-semibold">Tienda</span>
        </Link>
      </div>
    </nav>
  );
}

export function AdminSidebar() {
  const router = useRouter();
  const isActive = useIsActive();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  async function handleLogout() {
    await AuthService.logout();
    logout();
    router.push(ROUTES.LOGIN);
  }

  return (
    <aside className="border-border bg-surface hidden w-64 shrink-0 flex-col border-r md:flex">
      <div className="border-border border-b px-5 py-5">
        <p className="text-brand text-lg font-black tracking-tight">Clic Moda SCZ</p>
        <p className="text-text-muted mt-0.5 text-xs">Panel de administración</p>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
              isActive(href)
                ? 'bg-brand-subtle text-brand'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary',
            ].join(' ')}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-border space-y-3 border-t p-4">
        <Link
          href={ROUTES.HOME}
          className="text-text-muted hover:text-text-primary flex items-center gap-2 px-3 py-2 text-sm transition-colors"
        >
          <Store size={15} />
          Ver tienda
        </Link>
        {user && (
          <div className="flex items-center justify-between gap-2 px-3">
            <div className="min-w-0">
              <p className="text-text-primary truncate text-sm font-semibold">{user.name}</p>
              <p className="text-brand text-xs font-medium">
                {ROLE_LABELS[user.role] ?? user.role}
              </p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="text-text-muted hover:text-danger shrink-0 transition-colors"
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
