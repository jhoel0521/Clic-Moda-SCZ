import type { IBannerService } from '@src/core/contracts/IBannerService';
import type { IBannerPromocional } from '@src/core/models';
import { findAll, findById, update } from '../db/db';

export const BannerService: IBannerService = {
  async getActiveBanners(): Promise<IBannerPromocional[]> {
    const banners = findAll('banners');
    return banners.filter((b) => b.activo);
  },

  async getAllBanners(): Promise<IBannerPromocional[]> {
    return findAll('banners');
  },

  async toggleBanner(id: string): Promise<IBannerPromocional | null> {
    const banner = findById<IBannerPromocional>('banners', id);
    if (!banner) return null;
    banner.activo = !banner.activo;
    return update('banners', banner);
  },

  async updateBanner(
    id: string,
    data: Partial<Omit<IBannerPromocional, 'id'>>
  ): Promise<IBannerPromocional | null> {
    const banner = findById<IBannerPromocional>('banners', id);
    if (!banner) return null;
    return update('banners', { ...banner, ...data });
  },
};
