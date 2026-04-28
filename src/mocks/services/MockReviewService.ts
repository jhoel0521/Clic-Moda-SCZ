import { delay } from '@src/mocks/utils/delay';
import reviewsData from '@src/mocks/data/reviews.json';
import type { IResena, ICreateResenaData } from '@src/core/models';

const mockReviewsDB: IResena[] = reviewsData as unknown as IResena[];
let reviewIdCounter = mockReviewsDB.length + 1;

export const MockReviewService = {
  async getReviewsByProduct(productoId: string): Promise<IResena[]> {
    await delay(200, 500);
    return mockReviewsDB.filter(
      (r) => r.producto_id === productoId && r.estado_moderacion === 'APROBADA',
    );
  },

  async getPendingReviews(): Promise<IResena[]> {
    await delay(100, 300);
    return mockReviewsDB.filter((r) => r.estado_moderacion === 'PENDIENTE');
  },

  async createReview(data: ICreateResenaData & { autor_nombre?: string }): Promise<IResena> {
    await delay(300, 600);

    const newReview: IResena = {
      id: `rev_${String(reviewIdCounter++).padStart(3, '0')}`,
      producto_id: data.producto_id,
      usuario_id: data.usuario_id,
      autor_nombre: data.autor_nombre,
      calificacion_estrellas: data.calificacion_estrellas,
      comentario: data.comentario,
      estado_moderacion: 'PENDIENTE',
      imagenes: [],
      creado_en: new Date().toISOString(),
    };

    mockReviewsDB.push(newReview);
    return newReview;
  },

  async moderateReview(
    reviewId: string,
    decision: 'APROBADA' | 'RECHAZADA',
  ): Promise<IResena | null> {
    await delay(100, 200);
    const review = mockReviewsDB.find((r) => r.id === reviewId);
    if (!review) return null;
    review.estado_moderacion = decision;
    return review;
  },

  async getProductRating(productoId: string): Promise<{ avg: number; count: number }> {
    await delay(100, 200);
    const approved = mockReviewsDB.filter(
      (r) => r.producto_id === productoId && r.estado_moderacion === 'APROBADA',
    );
    if (approved.length === 0) return { avg: 0, count: 0 };
    const avg = approved.reduce((sum, r) => sum + r.calificacion_estrellas, 0) / approved.length;
    return { avg: Math.round(avg * 10) / 10, count: approved.length };
  },
};
