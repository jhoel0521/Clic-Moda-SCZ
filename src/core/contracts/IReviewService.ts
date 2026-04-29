import type { IResena, ICreateResenaData } from '@src/core/models';

export interface IReviewService {
  getReviewsByProduct(productoId: string): Promise<IResena[]>;
  getPendingReviews(): Promise<IResena[]>;
  createReview(data: ICreateResenaData & { autor_nombre?: string }): Promise<IResena>;
  moderateReview(reviewId: string, decision: 'APROBADA' | 'RECHAZADA'): Promise<IResena | null>;
  getProductRating(productoId: string): Promise<{ avg: number; count: number }>;
}
