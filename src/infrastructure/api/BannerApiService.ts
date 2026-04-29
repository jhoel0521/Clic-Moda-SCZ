import type { IBannerService } from '@src/core/contracts/IBannerService';
import type { IBannerPromocional } from '@src/core/models';
import { apiFetch } from '@src/services/api';

export const BannerApiService: IBannerService = {
  async getActiveBanners() {
    return apiFetch<IBannerPromocional[]>('/api/banners?active=true');
  },

  async getAllBanners() {
    return apiFetch<IBannerPromocional[]>('/api/banners');
  },

  async toggleBanner(id: string) {
    return apiFetch<IBannerPromocional>(`/api/banners/${id}/toggle`, {
      method: 'PATCH',
    });
  },
};
