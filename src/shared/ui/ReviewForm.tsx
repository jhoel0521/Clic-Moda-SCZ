'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuthStore } from '@src/core/store/useAuthStore';
import { MockReviewService } from '@src/mocks/services/MockReviewService';
import { Button } from '@src/shared/ui/Button';
import type { IResena } from '@src/core/models';

interface ReviewFormProps {
  productId: string;
  onSuccess: (review: IResena) => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-5 py-4 text-sm text-[var(--color-text-muted)]">
        <a href="/login" className="font-semibold text-[var(--color-brand)] hover:underline">
          Iniciá sesión
        </a>{' '}
        para dejar una reseña en este producto.
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
        ¡Gracias por tu reseña! Está pendiente de aprobación y aparecerá pronto.
      </div>
    );
  }

  async function handleSubmit() {
    if (selectedStar === 0) { setError('Seleccioná una calificación'); return; }
    if (comment.trim().length < 10) { setError('El comentario debe tener al menos 10 caracteres'); return; }
    setIsLoading(true);
    setError(null);
    try {
      const review = await MockReviewService.createReview({
        producto_id: productId,
        usuario_id: user!.id,
        calificacion_estrellas: selectedStar,
        comentario: comment.trim(),
        autor_nombre: user!.name,
      });
      onSuccess(review);
      setSubmitted(true);
    } catch {
      setError('Ocurrió un error. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  const activeStar = hoveredStar || selectedStar;

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-[var(--shadow-sm)]">
      <p className="mb-4 font-semibold text-[var(--color-text-primary)]">Dejá tu reseña</p>

      {/* Estrellas */}
      <div className="mb-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
            onClick={() => { setSelectedStar(star); setError(null); }}
            className="transition-transform hover:scale-110"
          >
            <Star
              size={28}
              className={star <= activeStar ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
            />
          </button>
        ))}
        {selectedStar > 0 && (
          <span className="ml-2 self-center text-sm text-[var(--color-text-muted)]">
            {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][selectedStar]}
          </span>
        )}
      </div>

      {/* Comentario */}
      <textarea
        rows={3}
        value={comment}
        onChange={(e) => { setComment(e.target.value); setError(null); }}
        placeholder="Contá tu experiencia con este producto..."
        className="mb-3 w-full rounded-xl border border-[var(--color-border)] bg-white px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]"
      />

      {error && <p className="mb-3 text-xs text-[var(--color-danger)] font-medium">{error}</p>}

      <Button variant="primary" size="sm" isLoading={isLoading} onClick={handleSubmit}>
        Publicar reseña
      </Button>
    </div>
  );
}
