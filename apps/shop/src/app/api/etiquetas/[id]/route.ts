import { NextRequest, NextResponse } from 'next/server';
import { EtiquetaService } from '@src/backend/services/EtiquetaService';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const etiqueta = await EtiquetaService.getById(id);
    if (!etiqueta) {
      return NextResponse.json({ error: 'Etiqueta no encontrada' }, { status: 404 });
    }
    return NextResponse.json(etiqueta);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { nombre } = await req.json();
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 });
    }
    const etiqueta = await EtiquetaService.update(id, nombre.trim());
    if (!etiqueta) {
      return NextResponse.json({ error: 'Etiqueta no encontrada' }, { status: 404 });
    }
    return NextResponse.json(etiqueta);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const success = await EtiquetaService.remove(id);
    if (!success) {
      return NextResponse.json({ error: 'Etiqueta no encontrada' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
