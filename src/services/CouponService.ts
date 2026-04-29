import type { ICouponService } from '@src/core/contracts/ICouponService';
import { apiFetch } from './api';

export const CouponService: ICouponService = {
  async validateCoupon(codigo) {
    const coupons = await apiFetch<any[]>('/api/coupons');
    return coupons.find((c) => c.codigo === codigo.toUpperCase()) ?? null;
  },

  async applyCoupon(codigo, subtotal) {
    return apiFetch('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ codigo, subtotal }),
    });
  },

  async getCoupons() {
    return apiFetch('/api/coupons');
  },

  async createCoupon(data) {
    return apiFetch('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteCoupon(id) {
    await apiFetch(`/api/coupons/${id}`, {
      method: 'DELETE',
    });
  },
};
