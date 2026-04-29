import { NextRequest, NextResponse } from 'next/server';
import { BannerService } from '@src/backend/services/BannerService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const banner = await BannerService.toggleBanner(id);
    return NextResponse.json(banner);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
