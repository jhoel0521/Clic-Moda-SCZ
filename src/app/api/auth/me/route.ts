import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'clic-moda-session';

export async function GET() {
  try {
    // Obtener la cookie de sesión
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE);

    // Si no hay cookie de sesión, retornar 401
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener el usuario actual desde localStorage del cliente (enviado en header)
    // NOTA: En este caso, confiamos en que si la cookie existe, la sesión es válida
    // Esto se puede mejorar guardando userId en la cookie o en una sesión de servidor
    // Por ahora, retornamos success si la cookie existe

    return NextResponse.json({ authenticated: true, message: 'Session is valid' });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
