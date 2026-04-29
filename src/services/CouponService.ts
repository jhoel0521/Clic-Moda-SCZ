import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { ICouponService } from '@src/core/contracts/ICouponService';
import type { ICuponDescuento } from '@src/core/models';

export const CouponService: ICouponService = {
  async validateCoupon(codigo: string) {
    const service = await ServiceFactory.getCouponService();
    return service.validateCoupon(codigo);
  },

  async applyCoupon(codigo: string, subtotal: number) {
    const service = await ServiceFactory.getCouponService();
    return service.applyCoupon(codigo, subtotal);
  },

  async getCoupons() {
    const service = await ServiceFactory.getCouponService();
    return service.getCoupons();
  },

  async createCoupon(data: Omit<ICuponDescuento, 'id' | 'veces_usado'>) {
    const service = await ServiceFactory.getCouponService();
    return service.createCoupon(data);
  },

  async deleteCoupon(id: string) {
    const service = await ServiceFactory.getCouponService();
    return service.deleteCoupon(id);
  },
};
