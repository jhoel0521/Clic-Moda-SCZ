'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, User, Menu, X } from 'lucide-react';
import { ROUTES } from '@src/routes';
import { useCartStore } from '@src/core/store/useCartStore';
import { useAuthStore } from '@src/core/store/useAuthStore';

const NAV_LINKS = [
  { label: 'Inicio', href: ROUTES.HOME },
  { label: 'Catálogo', href: ROUTES.CATALOG },
  { label: 'Nosotros', href: ROUTES.ABOUT },
  { label: 'Contacto', href: ROUTES.CONTACT },
] as const;

export function StoreNavbar() {
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, transparent)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'var(--color-border)',
      }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link
          href={ROUTES.HOME}
          className="gradient-text font-bold text-xl tracking-tight shrink-0"
        >
          Clic Moda SCZ
        </Link>

        {/* Desktop nav — oculto en mobile */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-flex items-center h-9 px-4 rounded-lg text-sm font-medium transition-colors"
                style={{
                  color: isActive(link.href)
                    ? 'var(--color-brand)'
                    : 'var(--color-text-secondary)',
                  backgroundColor: isActive(link.href)
                    ? 'var(--color-brand-subtle)'
                    : 'transparent',
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Acciones — carrito, login, hamburger */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Carrito con badge */}
          <Link
            href={ROUTES.CART}
            className="relative inline-flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label="Ver carrito"
          >
            <ShoppingBag size={22} />
            {itemCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold text-white px-1"
                style={{ background: 'var(--gradient-brand)' }}
              >
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* Login / Perfil */}
          <Link
            href={isAuthenticated ? ROUTES.PROFILE : ROUTES.LOGIN}
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
            aria-label={isAuthenticated ? 'Mi perfil' : 'Iniciar sesión'}
          >
            <User size={22} />
          </Link>

          {/* Hamburger — solo mobile */}
          <button
            type="button"
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl transition-colors md:hidden"
            style={{ color: 'var(--color-text-secondary)' }}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          className="md:hidden border-t py-2"
          style={{
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg)',
          }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center h-12 px-6 text-sm font-medium transition-colors"
              style={{
                color: isActive(link.href)
                  ? 'var(--color-brand)'
                  : 'var(--color-text-secondary)',
                backgroundColor: isActive(link.href)
                  ? 'var(--color-brand-subtle)'
                  : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
