import type { IReviewService } from '@src/core/contracts/IReviewService';
import { apiFetch } from './api';

export const ReviewService: IReviewService = {
  async getReviewsByProduct(productoId) {
    return apiFetch(`/api/reviews?productId=${productoId}`);
  },

  async getPendingReviews() {
    return apiFetch('/api/reviews?pending=true');
  },

  async createReview(data) {
    return apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async moderateReview(reviewId, decision) {
    return apiFetch(`/api/reviews/${reviewId}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify({ decision }),
    });
  },

  async getProductRating(productoId) {
    const reviews = await this.getReviewsByProduct(productoId);
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const avg = reviews.reduce((sum, r) => sum + r.calificacion_estrellas, 0) / reviews.length;
    return { avg: Math.round(avg * 10) / 10, count: reviews.length };
  },
};
