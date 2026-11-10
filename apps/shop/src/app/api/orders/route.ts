import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@src/backend/services/OrderService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId') || undefined;
    const orders = await OrderService.getOrders(userId);
    return NextResponse.json(orders);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const order = await OrderService.createOrder(body);
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
