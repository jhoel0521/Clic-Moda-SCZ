import type { IBannerService } from '@src/core/contracts/IBannerService';
import { apiFetch } from './api';

export const BannerService: IBannerService = {
  async getActiveBanners() {
    return apiFetch('/api/banners?active=true');
  },

  async getAllBanners() {
    return apiFetch('/api/banners');
  },

  async toggleBanner(id) {
    return apiFetch(`/api/banners/${id}/toggle`, {
      method: 'PATCH',
    });
  },
};
