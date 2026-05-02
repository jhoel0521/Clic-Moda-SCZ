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

export function MobileBottomNav() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount);

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 h-[4.5rem] border-t border-gray-200 bg-white/90 shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.05)] backdrop-blur-md md:hidden">
      <div className="flex h-full items-center justify-around px-2">
        {TABS.map(({ label, href, icon: Icon }) => {
          const isCart = href === ROUTES.CART;
          const isActive = pathname === href || (href !== ROUTES.HOME && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 transition-colors ${
                isActive ? 'text-pink-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className="relative">
                <Icon
                  size={24}
                  className={isActive ? 'fill-pink-600 stroke-pink-600' : ''}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white shadow-md">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-none font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
