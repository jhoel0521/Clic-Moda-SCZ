import type { IconName } from '../components/icons';

export interface NavLink {
  label: string;
  href: string;
  icon: IconName;
}

// Enlaces del esqueleto de la tienda (barra superior, menú del teléfono y barra inferior).
export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Inicio', href: '/', icon: 'home' },
  { label: 'Catálogo', href: '/catalogo', icon: 'catalog' },
  { label: 'Contacto', href: '/contacto', icon: 'contact' },
];

// La página activa: el inicio solo con "/"; el resto también en sus subrutas (/p/<slug> cuenta como catálogo).
export function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/catalogo') return pathname === href || pathname.startsWith('/p/');
  return pathname === href || pathname.startsWith(`${href}/`);
}
