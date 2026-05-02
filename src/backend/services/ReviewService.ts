import type { IReviewService } from '@src/core/contracts/IReviewService';
import type { IResena, ICreateResenaData } from '@src/core/models';
import { findAll, findById, insert, update } from '../db/db';
import crypto from 'crypto';

export const ReviewService: IReviewService = {
  async getReviewsByProduct(productoId: string): Promise<IResena[]> {
    const reviews = findAll('reviews');
    return reviews.filter(
      (r) => r.producto_id === productoId && r.estado_moderacion === 'APROBADA'
    );
  },

  async getPendingReviews(): Promise<IResena[]> {
    const reviews = findAll('reviews');
    return reviews.filter((r) => r.estado_moderacion === 'PENDIENTE');
  },

  async createReview(data: ICreateResenaData & { autor_nombre?: string }): Promise<IResena> {
    const newReview: IResena = {
      id: `rev_${crypto.randomUUID().substring(0, 8)}`,
      producto_id: data.producto_id,
      usuario_id: data.usuario_id,
      autor_nombre: data.autor_nombre,
      calificacion_estrellas: data.calificacion_estrellas,
      comentario: data.comentario,
      estado_moderacion: 'PENDIENTE',
      imagenes: [],
      creado_en: new Date().toISOString(),
    };

    return insert('reviews', newReview);
  },

  async moderateReview(
    reviewId: string,
    decision: 'APROBADA' | 'RECHAZADA'
  ): Promise<IResena | null> {
    const review = findById<IResena>('reviews', reviewId);
    if (!review) return null;
    review.estado_moderacion = decision;
    return update('reviews', review);
  },

  async getProductRating(productoId: string): Promise<{ avg: number; count: number }> {
    const reviews = findAll('reviews');
    const approved = reviews.filter(
      (r) => r.producto_id === productoId && r.estado_moderacion === 'APROBADA'
    );
    if (approved.length === 0) return { avg: 0, count: 0 };
    const avg = approved.reduce((sum, r) => sum + r.calificacion_estrellas, 0) / approved.length;
    return { avg: Math.round(avg * 10) / 10, count: approved.length };
  },
};
