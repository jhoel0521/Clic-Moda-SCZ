import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@src/backend/services/AuthService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await AuthService.register(body);
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
