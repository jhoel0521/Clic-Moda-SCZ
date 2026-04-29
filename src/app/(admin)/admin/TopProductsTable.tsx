import type { IOrder } from '@src/core/models';

interface TopProductsTableProps {
  orders: IOrder[];
}

export function TopProductsTable({ orders }: TopProductsTableProps) {
  const countMap: Map<string, { name: string; units: number; revenue: number }> = new Map();

  for (const order of orders) {
    for (const item of order.items) {
      const key = item.product.id;
      const existing = countMap.get(key);
      if (existing) {
        existing.units += item.quantity;
        existing.revenue += item.unitPrice * item.quantity;
      } else {
        countMap.set(key, {
          name: item.product.name,
          units: item.quantity,
          revenue: item.unitPrice * item.quantity,
        });
      }
    }
  }

  const top10 = Array.from(countMap.values())
    .sort((a, b) => b.units - a.units)
    .slice(0, 10);

  if (top10.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] text-center py-6">
        Aún no hay pedidos para mostrar el ranking.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-secondary)] border-b border-[var(--color-border)]">
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--color-text-muted)] w-8">#</th>
            <th className="px-4 py-2.5 text-left font-semibold text-[var(--color-text-primary)]">Producto</th>
            <th className="px-4 py-2.5 text-right font-semibold text-[var(--color-text-primary)]">Unidades</th>
            <th className="hidden sm:table-cell px-4 py-2.5 text-right font-semibold text-[var(--color-text-primary)]">Ingresos</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--color-border)] bg-white">
          {top10.map((product, idx) => (
            <tr key={product.name} className="hover:bg-[var(--color-surface-hover)]">
              <td className="px-4 py-2.5 font-bold text-[var(--color-text-muted)]">{idx + 1}</td>
              <td className="px-4 py-2.5 font-medium text-[var(--color-text-primary)] line-clamp-1">{product.name}</td>
              <td className="px-4 py-2.5 text-right font-semibold text-[var(--color-brand)]">{product.units}</td>
              <td className="hidden sm:table-cell px-4 py-2.5 text-right text-[var(--color-text-secondary)]">
                Bs. {product.revenue.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
