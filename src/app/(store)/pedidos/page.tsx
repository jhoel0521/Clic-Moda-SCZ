import { Suspense } from 'react';
import { PageSpinner } from '@src/shared/ui/Spinner';
import { OrderDetailPage } from './OrderDetail';

export default function OrderPage() {
  return (
    <Suspense fallback={<PageSpinner label="Cargando pedido..." />}>
      <OrderDetailPage />
    </Suspense>
  );
}
