import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@src/backend/services/AuthService';

const SESSION_COOKIE = 'clic-moda-session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user = await AuthService.login(body);
    const res = NextResponse.json(user);
    res.cookies.set(SESSION_COOKIE, '1', {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
      httpOnly: false,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 401 });
  }
}
