'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { useCartStore } from '@src/core/store/useCartStore';
import { AuthService } from '@src/services/AuthService';
import { ROUTES } from '@src/routes';

export function StoreNavbar() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const itemCount = useCartStore((s) => s.itemCount);

  async function handleLogout() {
    await AuthService.logout();
    logout();
  }

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-[1600px] w-full px-6 lg:px-12 h-20 flex items-center justify-between">

        {/* LOGO */}
        <div className="flex-shrink-0">
          <Link href={ROUTES.HOME} className="text-2xl lg:text-3xl font-black tracking-tighter text-gray-900">
            CLIC MODA SCZ<span className="text-pink-600">.</span>
          </Link>
        </div>

        {/* MENÚ CENTRAL */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8 lg:gap-12">
          <Link href={ROUTES.HOME} className="text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            INICIO
          </Link>
          <Link href={ROUTES.CATALOG} className="text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            CATÁLOGO
          </Link>
          <Link href={ROUTES.ABOUT} className="text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            NOSOTROS
          </Link>
          <Link href={ROUTES.CONTACT} className="hidden lg:block text-sm font-bold text-gray-500 hover:text-pink-600 transition-colors">
            CONTACTO
          </Link>
        </nav>

        {/* DERECHA */}
        <div className="flex items-center gap-3 lg:gap-5">
          {isAuthenticated && user ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                href={ROUTES.PROFILE}
                className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-pink-600 transition-colors"
              >
                <User size={16} />
                <span className="hidden lg:inline">{user.name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-400 hover:text-pink-600 transition-colors"
                aria-label="Cerrar sesión"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href={ROUTES.LOGIN}
              className="hidden sm:flex items-center text-sm font-bold text-gray-600 hover:text-pink-600 transition-colors"
            >
              Iniciar sesión
            </Link>
          )}

          <div className="hidden sm:block w-px h-6 bg-gray-200" />

          <Link
            href={ROUTES.CART}
            className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-pink-600 transition-all shadow-md font-medium text-sm hover:-translate-y-0.5"
          >
            <ShoppingCart size={16} />
            <span className="hidden lg:inline">Carrito</span>
            <span className="bg-white text-gray-900 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {itemCount > 9 ? '9+' : itemCount}
            </span>
          </Link>
        </div>

      </div>
    </header>
  );
}
