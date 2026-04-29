import type { ICouponService } from '@src/core/contracts/ICouponService';
import type { ICuponDescuento } from '@src/core/models';
import { apiFetch } from './api';

export const CouponService: ICouponService = {
  async validateCoupon(codigo: string) {
    const coupons = await apiFetch<ICuponDescuento[]>('/api/coupons');
    return coupons.find((c) => c.codigo === codigo.toUpperCase()) ?? null;
  },

  async applyCoupon(codigo: string, subtotal: number) {
    return apiFetch('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ codigo, subtotal }),
    });
  },

  async getCoupons() {
    return apiFetch('/api/coupons');
  },

  async createCoupon(data: Omit<ICuponDescuento, 'id' | 'veces_usado'>) {
    return apiFetch('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCoupon(id: string) {
    await apiFetch(`/api/coupons/${id}`, {
      method: 'DELETE',
    });
  },
};
