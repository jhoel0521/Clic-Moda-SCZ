'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Package, ShirtIcon, AlertTriangle } from 'lucide-react';
import { OrderService } from '@src/services/OrderService';
import { ProductService } from '@src/services/ProductService';
import { AdminHeader } from '@src/app/(admin)/AdminHeader';
import { StockAlertFeed } from './StockAlertFeed';
import { TopProductsTable } from './TopProductsTable';
import { Spinner } from '@src/shared/ui/Spinner';
import type { IOrder, IProduct } from '@src/core/models';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([OrderService.getOrders(), ProductService.getProducts()])
      .then(([ord, prod]) => {
        setOrders(ord);
        setProducts(prod);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const dailySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const newOrders = orders.filter((o) => o.status === 'PROCESADO').length;
  const activeProducts = products.filter((p) => p.estado === 'activo').length;
  const lowStockCount = products.filter((p) => p.stock <= 5 && p.stock > 0).length;

  const stats = [
    {
      label: 'Ventas hoy',
      value: `Bs. ${dailySales.toFixed(0)}`,
      icon: ShoppingBag,
      tone: 'text-success',
    },
    { label: 'Pedidos nuevos', value: String(newOrders), icon: Package, tone: 'text-info' },
    {
      label: 'Productos activos',
      value: String(activeProducts),
      icon: ShirtIcon,
      tone: 'text-brand',
    },
    {
      label: 'Stock crítico',
      value: String(lowStockCount),
      icon: AlertTriangle,
      tone: 'text-warning',
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader title="Dashboard" />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="border-border bg-surface rounded-2xl border p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-text-muted text-sm">{label}</span>
                  <Icon size={18} className={tone} />
                </div>
                <p className={`text-2xl font-bold ${tone}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Grid principal */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* Top productos */}
            <div className="border-border bg-surface rounded-2xl border p-5 shadow-sm">
              <h3 className="text-text-primary mb-4 text-sm font-bold">
                Top 10 Productos Vendidos
              </h3>
              <TopProductsTable orders={orders} />
            </div>

            {/* Stock alerts */}
            <StockAlertFeed />
          </div>
        </>
      )}
    </div>
  );
}
