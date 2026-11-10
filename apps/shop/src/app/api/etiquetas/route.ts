import { NextRequest, NextResponse } from 'next/server';
import { EtiquetaService } from '@src/backend/services/EtiquetaService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productoId = searchParams.get('productoId');

    if (productoId) {
      const etiquetas = await EtiquetaService.getByProducto(productoId);
      return NextResponse.json(etiquetas);
    }

    const etiquetas = await EtiquetaService.getAll();
    return NextResponse.json(etiquetas);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre } = await req.json();
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    const etiqueta = await EtiquetaService.create(nombre.trim());
    return NextResponse.json(etiqueta);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
