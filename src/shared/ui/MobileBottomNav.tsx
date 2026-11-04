'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid2x2, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@src/core/store/useCartStore';
import { ROUTES } from '@src/routes';

const TABS = [
  { label: 'Inicio', href: ROUTES.HOME, icon: Home },
  { label: 'Catálogo', href: ROUTES.CATALOG, icon: Grid2x2 },
  { label: 'Carrito', href: ROUTES.CART, icon: ShoppingCart },
  { label: 'Perfil', href: ROUTES.PROFILE, icon: User },
] as const;

/** En producto y checkout manda la barra de acción propia de cada pantalla. */
const HIDDEN_ON = ['/producto', ROUTES.CHECKOUT];

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount);

  if (HIDDEN_ON.some((route) => pathname.startsWith(route))) return null;

  return (
    <nav className="safe-bottom fixed right-0 bottom-0 left-0 z-50 border-t border-gray-200 bg-white md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {TABS.map(({ label, href, icon: Icon }) => {
          const isCart = href === ROUTES.CART;
          const isActive = href === ROUTES.HOME ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={`flex h-full flex-1 flex-col items-center justify-center gap-1 ${
                isActive ? 'text-pink-600' : 'text-gray-500'
              }`}
            >
              <span className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.4 : 1.8} />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-600 px-1 text-[11px] font-bold text-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </span>
              <span className="text-[11px] leading-none font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
