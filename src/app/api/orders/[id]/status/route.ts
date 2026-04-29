import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@src/backend/services/OrderService';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const order = await OrderService.updateOrderStatus(id, body.status);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
