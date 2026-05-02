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
      <p className="text-text-muted py-6 text-center text-sm">
        Aún no hay pedidos para mostrar el ranking.
      </p>
    );
  }

  return (
    <div className="border-border overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-bg-secondary border-border border-b">
            <th className="text-text-muted w-8 px-4 py-2.5 text-left font-semibold">#</th>
            <th className="text-text-primary px-4 py-2.5 text-left font-semibold">Producto</th>
            <th className="text-text-primary px-4 py-2.5 text-right font-semibold">Unidades</th>
            <th className="text-text-primary hidden px-4 py-2.5 text-right font-semibold sm:table-cell">
              Ingresos
            </th>
          </tr>
        </thead>
        <tbody className="divide-border divide-y bg-white">
          {top10.map((product, idx) => (
            <tr key={product.name} className="hover:bg-surface-hover">
              <td className="text-text-muted px-4 py-2.5 font-bold">{idx + 1}</td>
              <td className="text-text-primary line-clamp-1 px-4 py-2.5 font-medium">
                {product.name}
              </td>
              <td className="text-brand px-4 py-2.5 text-right font-semibold">{product.units}</td>
              <td className="text-text-secondary hidden px-4 py-2.5 text-right sm:table-cell">
                Bs. {product.revenue.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
