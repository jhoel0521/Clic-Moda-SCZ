import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@src/backend/services/ProductService';

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await ProductService.toggleProductEstado(id);
  if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
  return NextResponse.json(product);
}
