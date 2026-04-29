'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Package } from 'lucide-react';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { MockOrderService } from '@src/mocks/services/MockOrderService';
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
    MockOrderService.getOrders(user?.id)
      .then((data) => setOrders(data.sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .finally(() => setIsLoading(false));
  }, [isAuthenticated, user?.id, router]);

  if (!isAuthenticated || !user) return null;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-14">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Mi perfil</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Hola, <span className="font-semibold text-[var(--color-text-primary)]">{user.name}</span>
        </p>
      </div>

      <div className="space-y-10">
        {/* Datos personales */}
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]">
          <h2 className="mb-5 flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
            <User size={18} className="text-[var(--color-brand)]" />
            Mis datos
          </h2>
          <ProfileDataForm />
        </section>

        {/* Historial de pedidos */}
        <section>
          <h2 className="mb-5 flex items-center gap-2 font-bold text-[var(--color-text-primary)]">
            <Package size={18} className="text-[var(--color-brand)]" />
            Mis pedidos
            {!isLoading && (
              <span className="text-sm font-normal text-[var(--color-text-muted)]">
                ({orders.length})
              </span>
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
