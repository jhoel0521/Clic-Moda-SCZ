import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@src/backend/services/AuthService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) throw new Error('UserId is required');
    
    const user = await AuthService.getProfile(userId);
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    return NextResponse.json(user);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
