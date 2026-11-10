import type { ICouponService } from '@src/core/contracts/ICouponService';
import type { ICuponDescuento, IAplicacionCupon } from '@src/core/models';
import { apiFetch } from '@src/services/api';

export const CouponApiService: ICouponService = {
  async validateCoupon(codigo: string) {
    const coupons = await apiFetch<ICuponDescuento[]>('/api/coupons');
    return coupons.find((c) => c.codigo === codigo.toUpperCase()) ?? null;
  },

  async applyCoupon(codigo: string, subtotal: number) {
    return apiFetch<IAplicacionCupon>('/api/coupons/apply', {
      method: 'POST',
      body: JSON.stringify({ codigo, subtotal }),
    });
  },

  async getCoupons() {
    return apiFetch<ICuponDescuento[]>('/api/coupons');
  },

  async createCoupon(data: Omit<ICuponDescuento, 'id' | 'veces_usado'>) {
    return apiFetch<ICuponDescuento>('/api/coupons', {
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
