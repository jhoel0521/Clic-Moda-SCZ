import { Suspense } from 'react';
import { PageSpinner } from '@src/shared/ui/Spinner';
import { ProductDetailClient } from './ProductDetailClient';

export default function ProductPage() {
  return (
    <Suspense fallback={<PageSpinner label="Cargando..." />}>
      <ProductDetailClient />
    </Suspense>
  );
}
