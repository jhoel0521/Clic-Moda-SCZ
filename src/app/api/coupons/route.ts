import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@src/backend/services/CouponService';

export async function GET() {
  try {
    const coupons = await CouponService.getCoupons();
    return NextResponse.json(coupons);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const coupon = await CouponService.createCoupon(body);
    return NextResponse.json(coupon);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
