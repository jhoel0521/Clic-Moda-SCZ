import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@src/backend/services/CouponService';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    await CouponService.deleteCoupon(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
