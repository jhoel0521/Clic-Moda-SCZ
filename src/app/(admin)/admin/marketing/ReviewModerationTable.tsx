'use client';

import { useEffect, useState } from 'react';
import { Star, Check, X } from 'lucide-react';
import { ReviewService } from '@src/services/ReviewService';
import { Spinner } from '@src/shared/ui/Spinner';
import type { IResena } from '@src/core/models';

export function ReviewModerationTable() {
  const [reviews, setReviews] = useState<IResena[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    ReviewService.getPendingReviews()
      .then(setReviews)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleModerate(id: string, decision: 'APROBADA' | 'RECHAZADA') {
    setProcessing(id);
    await ReviewService.moderateReview(id, decision);
    setReviews((prev) => prev.filter((r) => r.id !== id));
    setProcessing(null);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-14 text-center">
        <p className="text-[var(--color-text-muted)]">No hay reseñas pendientes de moderación.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {review.autor_nombre ?? 'Usuario anónimo'}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(review.creado_en).toLocaleDateString('es-BO')}
                </span>
              </div>
              <div className="mb-2 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.calificacion_estrellas ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{review.comentario}</p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">Producto: {review.producto_id}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                disabled={processing === review.id}
                onClick={() => handleModerate(review.id, 'APROBADA')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                <Check size={13} />
                Aprobar
              </button>
              <button
                type="button"
                disabled={processing === review.id}
                onClick={() => handleModerate(review.id, 'RECHAZADA')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
              >
                <X size={13} />
                Rechazar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
