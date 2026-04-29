import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { IReviewService } from '@src/core/contracts/IReviewService';
import type { ICreateResenaData, EstadoModeracion } from '@src/core/models';

export const ReviewService: IReviewService = {
  async getReviewsByProduct(productoId: string) {
    const service = await ServiceFactory.getReviewService();
    return service.getReviewsByProduct(productoId);
  },

  async getPendingReviews() {
    const service = await ServiceFactory.getReviewService();
    return service.getPendingReviews();
  },

  async createReview(data: ICreateResenaData) {
    const service = await ServiceFactory.getReviewService();
    return service.createReview(data);
  },

  async moderateReview(reviewId: string, decision: 'APROBADA' | 'RECHAZADA') {
    const service = await ServiceFactory.getReviewService();
    return service.moderateReview(reviewId, decision);
  },

  async getProductRating(productoId: string) {
    const service = await ServiceFactory.getReviewService();
    return service.getProductRating(productoId);
  },
};
