'use client';

import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProductService } from '@src/services/ProductService';
import { Button } from '@src/shared/ui/Button';
import { Spinner } from '@src/shared/ui/Spinner';
import type { IProduct } from '@src/core/models';

const flashSchema = z.object({
  productId: z.string().min(1, { message: 'Seleccioná un producto' }),
  endsAt: z.string().min(1, { message: 'Fecha/hora requerida' }),
});
type FlashFormData = z.infer<typeof flashSchema>;

export function FlashSaleConfig() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FlashFormData>({
    resolver: zodResolver(flashSchema),
  });

  useEffect(() => {
    ProductService.getProducts()
      .then((all) => setProducts(all.filter((p) => p.estado === 'activo')))
      .finally(() => setIsLoading(false));
  }, []);

  async function onSubmit(data: FlashFormData) {
    await ProductService.setFlashSale(data.productId, new Date(data.endsAt).toISOString());
    setSaved(true);
    reset();
    setTimeout(() => setSaved(false), 3000);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow-sm)]">
        <div className="mb-5 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <p className="font-semibold text-[var(--color-text-primary)]">Configurar Flash Sale</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              Producto
            </label>
            <select
              className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              {...register('productId')}
            >
              <option value="">Seleccionar producto...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Bs. {p.price}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.productId.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text-primary)]">
              Fin de la oferta
            </label>
            <input
              type="datetime-local"
              className="h-10 w-full rounded-xl border border-[var(--color-border)] bg-white px-3 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
              {...register('endsAt')}
            />
            {errors.endsAt && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.endsAt.message}</p>
            )}
          </div>

          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Activar Flash Sale
          </Button>

          {saved && (
            <p className="text-center text-sm font-medium text-emerald-600">
              ¡Flash Sale activada exitosamente!
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
