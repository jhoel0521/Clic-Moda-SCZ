import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@src/backend/services/CouponService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await CouponService.applyCoupon(body.codigo, body.subtotal);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
