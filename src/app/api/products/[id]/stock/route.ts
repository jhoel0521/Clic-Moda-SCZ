import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@src/backend/services/ProductService';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const success = await ProductService.decrementStock(id, body.decrement, body.size || 'M');
    return NextResponse.json({ success });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
