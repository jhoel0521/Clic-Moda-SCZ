/**
 * Layout del panel de administración (Route Group: (admin)).
 * Aplica a: /admin, /admin/productos, /admin/pedidos
 *
 * AdminSidebar y AdminHeader se construyen en Sprint 4.
 * Por ahora expone la estructura base con verificación de rol.
 */
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-secondary)]">
      {/* Sidebar placeholder — Sprint 4 */}
      <aside
        id="admin-sidebar"
        className="w-64 border-r border-[var(--color-border)] bg-[var(--color-surface)] flex flex-col p-4 gap-2 shrink-0"
      >
        <div className="px-2 py-3 mb-2">
          <span className="gradient-text font-bold text-lg tracking-tight">Clic Moda</span>
          <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">Panel de administración</span>
        </div>

        {[
          { label: 'Dashboard', href: '/admin', icon: '📊' },
          { label: 'Productos', href: '/admin/productos', icon: '👗' },
          { label: 'Pedidos', href: '/admin/pedidos', icon: '📦' },
          { label: 'Marketing', href: '/admin/marketing', icon: '🎯' },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all"
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col">
        <header
          id="admin-header"
          className="h-16 border-b border-[var(--color-border)] flex items-center justify-between px-6 bg-[var(--color-surface)] shrink-0"
        >
          <span className="text-sm text-[var(--color-text-muted)]">Panel de Control</span>
          <Link
            href="/"
            className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-brand)] transition-colors"
          >
            ← Volver a la tienda
          </Link>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
