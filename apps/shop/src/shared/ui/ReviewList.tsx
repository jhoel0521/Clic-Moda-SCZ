import { Star } from 'lucide-react';
import type { IResena } from '@src/core/models';

interface ReviewListProps {
  reviews: IResena[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <p className="text-text-muted py-8 text-center text-sm">
        Sé el primero en reseñar este producto.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article
          key={review.id}
          className="border-border bg-surface rounded-2xl border p-5 shadow-sm"
        >
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <p className="text-text-primary text-sm font-semibold">
                {review.autor_nombre ?? 'Cliente verificado'}
              </p>
              <p className="text-text-muted mt-0.5 text-xs">
                {new Date(review.creado_en).toLocaleDateString('es-BO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <StarRating rating={review.calificacion_estrellas} />
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">{review.comentario}</p>
        </article>
      ))}
    </div>
  );
}
