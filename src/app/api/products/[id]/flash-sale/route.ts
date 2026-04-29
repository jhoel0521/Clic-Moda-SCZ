import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@src/backend/services/ProductService';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await ProductService.setFlashSale(id, body.endsAt);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
