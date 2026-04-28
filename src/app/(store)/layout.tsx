/**
 * Layout de la tienda pública (Route Group: (store)).
 * Aplica a: /, /catalogo, /producto/[slug], /carrito, /checkout
 *
 * Incluirá Navbar y Footer en Sprint 1.
 * Por ahora expone la estructura base.
 */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar — se implementa en Sprint 1 */}
      <header
        id="store-header"
        className="h-16 border-b border-[var(--color-border)] flex items-center px-6 sticky top-0 z-40 bg-[var(--color-bg)]/90 backdrop-blur-md"
      >
        <span className="gradient-text font-bold text-xl tracking-tight">
          Clic Moda SCZ
        </span>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer — se implementa en Sprint 1 */}
      <footer
        id="store-footer"
        className="border-t border-[var(--color-border)] py-8 px-6 text-center text-sm text-[var(--color-text-muted)]"
      >
        © {new Date().getFullYear()} Clic Moda SCZ · Santa Cruz de la Sierra, Bolivia
      </footer>
    </div>
  );
}
