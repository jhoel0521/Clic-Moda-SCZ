import { Injectable } from '@nestjs/common';
import { ThrottlerGuard, type ThrottlerModuleOptions } from '@nestjs/throttler';

// Límite de intentos de inicio de sesión: 5 por correo en 15 minutos, sea cual sea el resultado
// (incluso con la contraseña correcta). Otros correos no se ven afectados.
export const LOGIN_ATTEMPTS_LIMIT = 5;
export const LOGIN_ATTEMPTS_WINDOW_MS = 15 * 60 * 1000;

export const LOGIN_THROTTLER: ThrottlerModuleOptions = [
  { name: 'login', ttl: LOGIN_ATTEMPTS_WINDOW_MS, limit: LOGIN_ATTEMPTS_LIMIT },
];

type RequestLike = { body?: { email?: unknown }; ip?: string };

@Injectable()
export class LoginThrottlerGuard extends ThrottlerGuard {
  // La clave es el correo normalizado; sin correo (petición mal formada) se usa la IP.
  protected async getTracker(request: Record<string, unknown>): Promise<string> {
    const { body, ip } = request as RequestLike;
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    return `login:${email || ip || 'desconocido'}`;
  }
}
