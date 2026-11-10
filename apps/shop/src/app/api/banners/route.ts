import { NextRequest, NextResponse } from 'next/server';
import { BannerService } from '@src/backend/services/BannerService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';

    if (activeOnly) {
      const banners = await BannerService.getActiveBanners();
      return NextResponse.json(banners);
    }

    const banners = await BannerService.getAllBanners();
    return NextResponse.json(banners);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
