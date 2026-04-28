import { delay } from '@src/mocks/utils/delay';
import bannersData from '@src/mocks/data/banners.json';
import type { IBannerPromocional } from '@src/core/models';

const mockBannersDB: IBannerPromocional[] = bannersData as unknown as IBannerPromocional[];

export const MockBannerService = {
  async getActiveBanners(): Promise<IBannerPromocional[]> {
    await delay(100, 300);
    return mockBannersDB.filter((b) => b.activo);
  },

  async getAllBanners(): Promise<IBannerPromocional[]> {
    await delay(100, 200);
    return [...mockBannersDB];
  },

  async toggleBanner(id: string): Promise<IBannerPromocional | null> {
    await delay(100, 200);
    const banner = mockBannersDB.find((b) => b.id === id);
    if (!banner) return null;
    banner.activo = !banner.activo;
    return banner;
  },
};
