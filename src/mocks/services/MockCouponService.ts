import { delay } from '@src/mocks/utils/delay';
import couponsData from '@src/mocks/data/coupons.json';
import type { ICuponDescuento, IAplicacionCupon } from '@src/core/models';

const mockCouponsDB: ICuponDescuento[] = couponsData as unknown as ICuponDescuento[];

export const MockCouponService = {
  async validateCoupon(codigo: string): Promise<ICuponDescuento | null> {
    await delay(200, 500);
    return mockCouponsDB.find((c) => c.codigo === codigo.toUpperCase()) ?? null;
  },

  async applyCoupon(codigo: string, subtotal: number): Promise<IAplicacionCupon> {
    await delay(300, 600);

    const coupon = mockCouponsDB.find((c) => c.codigo === codigo.toUpperCase());

    if (!coupon) {
      return { valid: false, discount: 0, errorMessage: 'Cupón no encontrado.' };
    }

    if (new Date(coupon.fecha_caducidad) < new Date()) {
      return { valid: false, discount: 0, errorMessage: 'El cupón ha expirado.' };
    }

    if (coupon.veces_usado >= coupon.limite_usos) {
      return { valid: false, discount: 0, errorMessage: 'El cupón ha alcanzado su límite de usos.' };
    }

    const discount = Math.round((subtotal * coupon.porcentaje_descuento) / 100);
    coupon.veces_usado += 1;

    return {
      valid: true,
      couponId: coupon.id,
      codigo: coupon.codigo,
      porcentaje: coupon.porcentaje_descuento,
      discount,
    };
  },

  async getCoupons(): Promise<ICuponDescuento[]> {
    await delay(100, 300);
    return [...mockCouponsDB];
  },

  async createCoupon(data: Omit<ICuponDescuento, 'id' | 'veces_usado'>): Promise<ICuponDescuento> {
    await delay(200, 400);
    const newCoupon: ICuponDescuento = {
      id: `cup_${Date.now()}`,
      veces_usado: 0,
      ...data,
      codigo: data.codigo.toUpperCase(),
    };
    mockCouponsDB.push(newCoupon);
    return newCoupon;
  },

  async deleteCoupon(id: string): Promise<void> {
    await delay(100, 200);
    const idx = mockCouponsDB.findIndex((c) => c.id === id);
    if (idx !== -1) mockCouponsDB.splice(idx, 1);
  },
};
