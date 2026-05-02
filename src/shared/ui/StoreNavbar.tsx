'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Search,
  Info,
  Mail,
  LayoutDashboard,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCartStore } from '@src/core/store/useCartStore';
import { AuthService } from '@src/services/AuthService';
import { ROUTES } from '@src/routes';
import { ADMIN_ROLES } from '@src/core/constants/ROLES';

const NAV_LINKS = [
  { label: 'Inicio', href: ROUTES.HOME },
  { label: 'Catálogo', href: ROUTES.CATALOG },
  { label: 'Nosotros', href: ROUTES.ABOUT },
  { label: 'Contacto', href: ROUTES.CONTACT },
] as const;

export function StoreNavbar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore((s) => s.itemCount);

  async function handleLogout() {
    await AuthService.logout();
    logout();
    setDrawerOpen(false);
  }

  const isActive = (href: string) =>
    href === ROUTES.HOME ? pathname === href : pathname.startsWith(href);

  return (
    <>
      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-40 h-12 w-full border-b border-gray-200 bg-white/90 shadow-md backdrop-blur-md lg:h-16">
        <div className="align-center flex h-full w-full justify-center">
          <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 md:px-8">
            {/* LEFT: hamburger + logo */}
            <div className="flex items-center gap-4">
              <button
                className="rounded-xl p-1.5 text-gray-800 transition-colors hover:text-pink-600 md:hidden"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                href={ROUTES.HOME}
                className="text-xl font-black tracking-tight whitespace-nowrap text-gray-900 sm:text-2xl"
                onClick={() => setDrawerOpen(false)}
              >
                CLIC <span className="text-pink-500">MODA SCZ</span>
              </Link>
            </div>
            <div className="w-15"></div>
            {/* CENTER: desktop links */}
            <nav className="hidden items-center gap-6 text-sm font-bold text-gray-600 md:flex lg:gap-8 lg:text-base">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-1 py-1 transition-colors hover:text-pink-600 ${
                    isActive(href) ? 'text-pink-600' : ''
                  }`}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-pink-500" />
                  )}
                </Link>
              ))}
            </nav>
            <div className="w-15"></div>
            {/* RIGHT: icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search desktop */}
              <button
                className="hidden rounded-xl p-2 text-gray-800 transition-colors hover:text-pink-600 md:flex"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5 lg:h-6 lg:w-6" />
              </button>

              {/* User / Logout (desktop) */}
              {isAuthenticated && user ? (
                <div className="hidden items-center gap-0.5 md:flex">
                  {ADMIN_ROLES.includes(user.role as (typeof ADMIN_ROLES)[number]) && (
                    <Link
                      href={ROUTES.ADMIN.DASHBOARD}
                      className="flex items-center gap-1 rounded-xl p-2 text-sm font-bold text-pink-600 transition-colors hover:bg-pink-50"
                      title="Admin"
                    >
                      <LayoutDashboard size={16} />
                      <span className="hidden lg:inline">Admin</span>
                    </Link>
                  )}
                  <Link
                    href={ROUTES.PROFILE}
                    className="rounded-xl p-2 text-gray-800 transition-colors hover:text-pink-600"
                    aria-label="Mi perfil"
                  >
                    <User className="h-5 w-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl p-2 text-gray-400 transition-colors hover:text-pink-600"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  className="hidden rounded-xl p-2 text-gray-800 transition-colors hover:text-pink-600 md:block"
                  aria-label="Iniciar sesión"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}

              {/* Cart icon siempre visible */}
              <Link
                href={ROUTES.CART}
                className="relative rounded-xl p-2 text-gray-800 transition-colors hover:text-pink-600"
                aria-label={`Carrito (${itemCount})`}
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-md">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE DRAWER ── (sin cambios) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />

          {/* Panel */}
          <div className="absolute top-0 bottom-0 left-0 flex w-3/4 max-w-sm flex-col bg-white shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <Link
                href={ROUTES.HOME}
                className="text-2xl font-black tracking-tight text-gray-900"
                onClick={() => setDrawerOpen(false)}
              >
                CLIC<span className="text-pink-500">MODA SCZ</span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl p-2 text-gray-500 hover:text-gray-900"
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Drawer links */}
            <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
              {NAV_LINKS.map(({ label, href }) => {
                const Icon =
                  href === ROUTES.HOME
                    ? undefined
                    : href === ROUTES.CATALOG
                      ? Search
                      : href === ROUTES.ABOUT
                        ? Info
                        : Mail;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-lg font-bold transition-colors ${
                      isActive(href) ? 'bg-pink-50 text-pink-600' : 'text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5" />}
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="border-t border-gray-100 px-4 py-6">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 font-bold text-gray-800"
                  >
                    <User className="h-5 w-5" />
                    {user.name.split(' ')[0]}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 font-bold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setDrawerOpen(false)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-50 py-3 font-bold text-pink-600 transition-colors hover:bg-pink-100"
                >
                  <User className="h-5 w-5" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
