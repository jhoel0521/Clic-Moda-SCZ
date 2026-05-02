'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package } from 'lucide-react';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { OrderService } from '@src/services/OrderService';
import { Spinner } from '@src/shared/ui/Spinner';
import { ROUTES } from '@src/routes';
import { ProfileDataForm } from './ProfileDataForm';
import { OrderHistoryTable } from './OrderHistoryTable';
import type { IOrder } from '@src/core/models';

export default function ProfilePage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`${ROUTES.LOGIN}?redirect=${ROUTES.PROFILE}`);
      return;
    }
    OrderService.getOrders(user?.id)
      .then((data) => setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, user?.id, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <div className="mb-10">
        <h1 className="text-text-primary text-3xl font-bold">Mi perfil</h1>
        <p className="text-text-muted mt-1">
          Hola, <span className="text-text-primary font-semibold">{user.name}</span>
        </p>
      </div>

      <div className="space-y-10">
        {/* Datos personales */}
        <section className="border-border bg-surface rounded-2xl border p-6 shadow-sm">
          <h2 className="text-text-primary mb-5 flex items-center gap-2 font-bold">
            <User size={18} className="text-brand" />
            Mis datos
          </h2>
          <ProfileDataForm />
        </section>

        {/* Historial de pedidos */}
        <section>
          <h2 className="text-text-primary mb-5 flex items-center gap-2 font-bold">
            <Package size={18} className="text-brand" />
            Mis pedidos
            {!isLoading && (
              <span className="text-text-muted text-sm font-normal">({orders.length})</span>
            )}
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Spinner size="md" />
            </div>
          ) : (
            <OrderHistoryTable orders={orders} />
          )}
        </section>
      </div>
    </div>
  );
}
