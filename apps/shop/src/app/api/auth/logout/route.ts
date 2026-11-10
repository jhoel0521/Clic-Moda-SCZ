import { NextResponse } from 'next/server';

const SESSION_COOKIE = 'clic-moda-session';

export async function POST() {
  try {
    const res = NextResponse.json({ message: 'Logged out successfully' });

    // Limpiar la cookie de sesión
    res.cookies.set(SESSION_COOKIE, '', {
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      httpOnly: false,
    });

    return res;
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
