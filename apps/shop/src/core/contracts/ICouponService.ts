import type { ICuponDescuento, IAplicacionCupon } from '@src/core/models';

export interface ICouponService {
  validateCoupon(codigo: string): Promise<ICuponDescuento | null>;
  applyCoupon(codigo: string, subtotal: number): Promise<IAplicacionCupon>;
  getCoupons(): Promise<ICuponDescuento[]>;
  createCoupon(data: Omit<ICuponDescuento, 'id' | 'veces_usado'>): Promise<ICuponDescuento>;
  deleteCoupon(id: string): Promise<void>;
}
