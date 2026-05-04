import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@src/backend/services/OrderService';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = await OrderService.getOrderById(id);
    if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
