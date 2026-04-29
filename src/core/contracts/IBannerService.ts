import type { IBannerPromocional } from '@src/core/models';

export interface IBannerService {
  getActiveBanners(): Promise<IBannerPromocional[]>;
  getAllBanners(): Promise<IBannerPromocional[]>;
  toggleBanner(id: string): Promise<IBannerPromocional | null>;
}
