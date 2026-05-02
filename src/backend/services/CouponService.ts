import type { ICouponService } from '@src/core/contracts/ICouponService';
import type { ICuponDescuento, IAplicacionCupon } from '@src/core/models';
import { findAll, insert, update, remove } from '../db/db';
import crypto from 'crypto';

export const CouponService: ICouponService = {
  async validateCoupon(codigo: string): Promise<ICuponDescuento | null> {
    const coupons = findAll('coupons');
    return coupons.find((c) => c.codigo === codigo.toUpperCase()) ?? null;
  },

  async applyCoupon(codigo: string, subtotal: number): Promise<IAplicacionCupon> {
    const coupon = await this.validateCoupon(codigo);

    if (!coupon) {
      return { valid: false, discount: 0, errorMessage: 'Cupón no encontrado.' };
    }

    if (new Date(coupon.fecha_caducidad) < new Date()) {
      return { valid: false, discount: 0, errorMessage: 'El cupón ha expirado.' };
    }

    if (coupon.veces_usado >= coupon.limite_usos) {
      return {
        valid: false,
        discount: 0,
        errorMessage: 'El cupón ha alcanzado su límite de usos.',
      };
    }

    const discount = Math.round((subtotal * coupon.porcentaje_descuento) / 100);

    // Incrementamos usos
    coupon.veces_usado += 1;
    update('coupons', coupon);

    return {
      valid: true,
      couponId: coupon.id,
      codigo: coupon.codigo,
      porcentaje: coupon.porcentaje_descuento,
      discount,
    };
  },

  async getCoupons(): Promise<ICuponDescuento[]> {
    return findAll('coupons');
  },

  async createCoupon(data: Omit<ICuponDescuento, 'id' | 'veces_usado'>): Promise<ICuponDescuento> {
    const newCoupon: ICuponDescuento = {
      id: `cup_${crypto.randomUUID().substring(0, 8)}`,
      veces_usado: 0,
      ...data,
      codigo: data.codigo.toUpperCase(),
    };
    return insert('coupons', newCoupon);
  },

  async deleteCoupon(id: string): Promise<void> {
    remove('coupons', id);
  },
};
