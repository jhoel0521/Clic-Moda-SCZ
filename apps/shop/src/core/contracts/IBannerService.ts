import type { IBannerPromocional } from '@src/core/models';

export interface IBannerService {
  getActiveBanners(): Promise<IBannerPromocional[]>;
  getAllBanners(): Promise<IBannerPromocional[]>;
  toggleBanner(id: string): Promise<IBannerPromocional | null>;
  updateBanner(
    id: string,
    data: Partial<Omit<IBannerPromocional, 'id'>>
  ): Promise<IBannerPromocional | null>;
}
