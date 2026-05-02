'use client';

import { useEffect, useState } from 'react';
import { Zap, X } from 'lucide-react';
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

function formatDate(iso: string | undefined) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' });
}

export function FlashSaleConfig() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [flashProducts, setFlashProducts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FlashFormData>({
    resolver: zodResolver(flashSchema),
  });

  useEffect(() => {
    ProductService.getProducts()
      .then((all: IProduct[]) => {
        const now = new Date();
        setProducts(all.filter((p) => p.estado === 'activo'));
        setFlashProducts(
          all.filter((p) => p.isFlashSale && p.flashSaleEndsAt && new Date(p.flashSaleEndsAt) > now)
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function onSubmit(data: FlashFormData) {
    const updated = await ProductService.setFlashSale(
      data.productId,
      new Date(data.endsAt).toISOString()
    );
    if (updated) {
      setFlashProducts((prev) => {
        const filtered = prev.filter((p) => p.id !== updated.id);
        return updated.isFlashSale ? [...filtered, updated] : filtered;
      });
    }
    setSaved(true);
    reset();
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleRemove(id: string) {
    setRemoving(id);
    const updated = await ProductService.setFlashSale(id, null);
    if (updated) {
      setFlashProducts((prev) => prev.filter((p) => p.id !== id));
    }
    setRemoving(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="border-border rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-2">
          <Zap size={18} className="text-amber-500" />
          <p className="text-text-primary font-semibold">Configurar Flash Sale</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">Producto</label>
            <select
              className="border-border text-text-primary focus:ring-brand h-10 w-full rounded-xl border bg-white px-3 text-sm focus:ring-2 focus:outline-none"
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
              <p className="text-danger mt-1 text-xs">{errors.productId.message}</p>
            )}
          </div>

          <div>
            <label className="text-text-primary mb-1.5 block text-sm font-medium">
              Fin de la oferta
            </label>
            <input
              type="datetime-local"
              className="border-border text-text-primary focus:ring-brand h-10 w-full rounded-xl border bg-white px-3 text-sm focus:ring-2 focus:outline-none"
              {...register('endsAt')}
            />
            {errors.endsAt && <p className="text-danger mt-1 text-xs">{errors.endsAt.message}</p>}
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

      {flashProducts.length > 0 && (
        <div className="border-border rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <p className="text-text-primary font-semibold">En Flash Sale ahora</p>
          </div>
          <div className="space-y-3">
            {flashProducts.map((p) => (
              <div
                key={p.id}
                className="border-border flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-text-primary truncate text-sm font-medium">{p.name}</p>
                  <p className="text-text-muted mt-0.5 text-xs">
                    Vence: {formatDate(p.flashSaleEndsAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  isLoading={removing === p.id}
                  leftIcon={<X size={13} />}
                  onClick={() => handleRemove(p.id)}
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
