import Link from 'next/link';
import { ROUTES } from '@src/routes';

export function StoreFooter() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="mx-auto max-w-7xl px-6 py-12 text-center">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:items-start">
          <div className="space-y-3 md:justify-self-center">
            <span className="gradient-text block text-xl font-bold tracking-tight">Clic Moda SCZ</span>
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-[var(--color-text-muted)]">
              Fast fashion para Santa Cruz de la Sierra. Tendencias nuevas, tallas exactas y entrega por WhatsApp.
            </p>
          </div>

          <div className="space-y-3 md:justify-self-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Tienda</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              {[
                { label: 'Inicio', href: ROUTES.HOME },
                { label: 'Catálogo', href: ROUTES.CATALOG },
                { label: 'Nosotros', href: ROUTES.ABOUT },
                { label: 'Contacto', href: ROUTES.CONTACT },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition-colors hover:text-[var(--color-brand)]">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 md:justify-self-center">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Contacto</p>
            <ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
              <li>+591 77 000-001</li>
              <li>contacto@clicmodascz.bo</li>
              <li>Lun–Sáb · 8:00–20:00</li>
              <li>Santa Cruz de la Sierra, Bolivia</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-[var(--color-border)] pt-6 text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Clic Moda SCZ · Todos los derechos reservados
        </div>
      </div>
    </footer>
  );
}
