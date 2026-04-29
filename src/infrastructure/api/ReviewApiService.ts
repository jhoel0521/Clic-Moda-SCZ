import type { IReviewService } from '@src/core/contracts/IReviewService';
import type { ICreateResenaData, EstadoModeracion, IResena } from '@src/core/models';
import { apiFetch } from '@src/services/api';

export const ReviewApiService: IReviewService = {
  async getReviewsByProduct(productoId: string) {
    return apiFetch<IResena[]>(`/api/reviews?productId=${productoId}`);
  },

  async getPendingReviews() {
    return apiFetch<IResena[]>('/api/reviews?pending=true');
  },

  async createReview(data: ICreateResenaData) {
    return apiFetch<IResena>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async moderateReview(reviewId: string, decision: 'APROBADA' | 'RECHAZADA') {
    return apiFetch<IResena>(`/api/reviews/${reviewId}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    });
  },

  async getProductRating(productoId: string) {
    const reviews = await this.getReviewsByProduct(productoId);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.calificacion_estrellas, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
  },
};
