'use client';

import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CouponService } from '@src/services/CouponService';
import { Modal } from '@src/shared/ui/Modal';
import { Input } from '@src/shared/ui/Input';
import { Button } from '@src/shared/ui/Button';
import { Spinner } from '@src/shared/ui/Spinner';
import type { ICuponDescuento } from '@src/core/models';

const couponSchema = z.object({
  codigo: z.string().min(3, { message: 'Mínimo 3 caracteres' }),
  porcentaje_descuento: z.coerce.number().int().min(1).max(100, { message: '1–100%' }),
  limite_usos: z.coerce.number().int().min(1, { message: 'Mínimo 1' }),
  fecha_caducidad: z.string().min(1, { message: 'Fecha requerida' }),
});
type CouponFormData = z.infer<typeof couponSchema>;

export function CouponManager() {
  const [coupons, setCoupons] = useState<ICuponDescuento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
  });

  useEffect(() => {
    CouponService.getCoupons()
      .then(setCoupons)
      .finally(() => setIsLoading(false));
  }, []);

  async function onSubmit(data: CouponFormData) {
    const created = await CouponService.createCoupon(data);
    setCoupons((prev) => [...prev, created]);
    reset();
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    await CouponService.deleteCoupon(id);
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    setDeleting(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const isExpired = (fecha: string) => new Date(fecha) < new Date();

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <Plus size={15} className="mr-1.5" />
          Nuevo cupón
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--color-border)] bg-white shadow-[var(--shadow-sm)]">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
            <tr>
              {['Código', 'Descuento', 'Usos', 'Caduca', 'Estado', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {coupons.map((c) => {
              const expired = isExpired(c.fecha_caducidad);
              const exhausted = c.veces_usado >= c.limite_usos;
              return (
                <tr key={c.id} className="hover:bg-[var(--color-surface)]">
                  <td className="px-4 py-3 font-mono font-semibold text-[var(--color-text-primary)]">{c.codigo}</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">{c.porcentaje_descuento}%</td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {c.veces_usado} / {c.limite_usos}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                    {new Date(c.fecha_caducidad).toLocaleDateString('es-BO')}
                  </td>
                  <td className="px-4 py-3">
                    <span className={[
                      'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                      expired || exhausted
                        ? 'bg-red-50 text-red-700'
                        : 'bg-emerald-50 text-emerald-700',
                    ].join(' ')}>
                      {expired ? 'Expirado' : exhausted ? 'Agotado' : 'Activo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      disabled={deleting === c.id}
                      onClick={() => handleDelete(c.id)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); reset(); }} title="Nuevo cupón" size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Código" placeholder="PROMO20" error={errors.codigo?.message} {...register('codigo')} />
          <Input label="Descuento (%)" type="number" min="1" max="100" error={errors.porcentaje_descuento?.message} {...register('porcentaje_descuento')} />
          <Input label="Límite de usos" type="number" min="1" error={errors.limite_usos?.message} {...register('limite_usos')} />
          <Input label="Fecha de caducidad" type="date" error={errors.fecha_caducidad?.message} {...register('fecha_caducidad')} />
          <Button type="submit" variant="primary" fullWidth isLoading={isSubmitting}>
            Crear cupón
          </Button>
        </form>
      </Modal>
    </>
  );
}
