import { ServiceFactory } from '@src/infrastructure/ServiceFactory';
import type { IBannerService } from '@src/core/contracts/IBannerService';

export const BannerService: IBannerService = {
  async getActiveBanners() {
    const service = await ServiceFactory.getBannerService();
    return service.getActiveBanners();
  },

  async getAllBanners() {
    const service = await ServiceFactory.getBannerService();
    return service.getAllBanners();
  },

  async toggleBanner(id: string) {
    const service = await ServiceFactory.getBannerService();
    return service.toggleBanner(id);
  },

  async updateBanner(
    id: string,
    data: Partial<Omit<import('@src/core/models').IBannerPromocional, 'id'>>
  ) {
    const service = await ServiceFactory.getBannerService();
    return service.updateBanner(id, data);
  },
};
