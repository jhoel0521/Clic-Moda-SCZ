import { NextRequest, NextResponse } from 'next/server';
import { BannerService } from '@src/backend/services/BannerService';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await req.json();
    const updated = await BannerService.updateBanner(id, data);
    if (!updated) return NextResponse.json({ error: 'Banner no encontrado' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
