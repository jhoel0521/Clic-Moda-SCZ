import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — Admin Clic Moda SCZ',
};

/**
 * Página del Dashboard de administración.
 * Sprint 0: Placeholder con estructura base.
 * Se construirá en Sprint 4 con estadísticas reales del mock.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <p className="text-[var(--color-text-muted)] text-sm mt-1">
          Resumen del día · Clic Moda SCZ
        </p>
      </div>

      {/* Tarjetas de stats placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Ventas hoy', value: 'Bs. 0', icon: '💰', color: 'var(--color-success)' },
          { label: 'Pedidos nuevos', value: '0', icon: '📦', color: 'var(--color-info)' },
          { label: 'Productos activos', value: '8', icon: '👗', color: 'var(--color-brand)' },
          { label: 'Stock crítico', value: '2', icon: '⚠️', color: 'var(--color-warning)' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl p-5 border border-[var(--color-border)] bg-[var(--color-surface)] space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-muted)]">{stat.label}</span>
              <span className="text-xl">{stat.icon}</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-[var(--color-text-muted)] text-sm">
          🚧 Dashboard completo disponible en <strong className="text-[var(--color-text-secondary)]">Sprint 4</strong>
        </p>
      </div>
    </div>
  );
}
