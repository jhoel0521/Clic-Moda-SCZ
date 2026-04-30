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
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-md h-12 lg:h-16">
        <div className="w-full flex justify-center align-center h-full" >
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-full flex items-center justify-between">
            {/* LEFT: hamburger + logo */}
            <div className="flex items-center gap-4">
              <button
                className="md:hidden p-1.5 text-gray-800 hover:text-pink-600 transition-colors rounded-xl"
                onClick={() => setDrawerOpen(true)}
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Link
                href={ROUTES.HOME}
                className="font-black text-xl sm:text-2xl tracking-tight text-gray-900 whitespace-nowrap"
                onClick={() => setDrawerOpen(false)}
              >
                CLIC <span className="text-pink-500">MODA SCZ</span>
              </Link>
            </div>
            <div className="w-15"></div>
            {/* CENTER: desktop links */}
            <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-bold text-gray-600 text-sm lg:text-base">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`relative px-1 py-1 transition-colors hover:text-pink-600 ${isActive(href) ? 'text-pink-600' : ''
                    }`}
                >
                  {label}
                  {isActive(href) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-pink-500 rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
            <div className="w-15"></div>
            {/* RIGHT: icons */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search desktop */}
              <button
                className="hidden md:flex p-2 text-gray-800 hover:text-pink-600 transition-colors rounded-xl"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5 lg:w-6 lg:h-6" />
              </button>

              {/* User / Logout (desktop) */}
              {isAuthenticated && user ? (
                <div className="hidden md:flex items-center gap-0.5">
                  {ADMIN_ROLES.includes(
                    user.role as (typeof ADMIN_ROLES)[number]
                  ) && (
                      <Link
                        href={ROUTES.ADMIN.DASHBOARD}
                        className="flex items-center gap-1 p-2 text-sm font-bold text-pink-600 hover:bg-pink-50 rounded-xl transition-colors"
                        title="Admin"
                      >
                        <LayoutDashboard size={16} />
                        <span className="hidden lg:inline">Admin</span>
                      </Link>
                    )}
                  <Link
                    href={ROUTES.PROFILE}
                    className="p-2 text-gray-800 hover:text-pink-600 transition-colors rounded-xl"
                    aria-label="Mi perfil"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-pink-600 transition-colors rounded-xl"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  className="hidden md:block p-2 text-gray-800 hover:text-pink-600 transition-colors rounded-xl"
                  aria-label="Iniciar sesión"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Cart icon siempre visible */}
              <Link
                href={ROUTES.CART}
                className="relative p-2 text-gray-800 hover:text-pink-600 transition-colors rounded-xl"
                aria-label={`Carrito (${itemCount})`}
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-pink-500 text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md">
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Panel */}
          <div className="absolute top-0 left-0 bottom-0 w-3/4 max-w-sm bg-white shadow-2xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <Link
                href={ROUTES.HOME}
                className="font-black text-2xl tracking-tight text-gray-900"
                onClick={() => setDrawerOpen(false)}
              >
                CLIC<span className="text-pink-500">MODA SCZ</span>
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-900 rounded-xl"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Drawer links */}
            <nav className="flex flex-col gap-1 px-4 py-6 flex-1">
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
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-lg transition-colors ${isActive(href)
                      ? 'bg-pink-50 text-pink-600'
                      : 'text-gray-800 hover:bg-gray-50'
                      }`}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="px-4 py-6 border-t border-gray-100">
              {isAuthenticated && user ? (
                <div className="flex flex-col gap-3">
                  <Link
                    href={ROUTES.PROFILE}
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 font-bold text-gray-800"
                  >
                    <User className="w-5 h-5" />
                    {user.name.split(' ')[0]}
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                </div>
              ) : (
                <Link
                  href={ROUTES.LOGIN}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-pink-50 text-pink-600 font-bold py-3 rounded-xl hover:bg-pink-100 transition-colors"
                >
                  <User className="w-5 h-5" />
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