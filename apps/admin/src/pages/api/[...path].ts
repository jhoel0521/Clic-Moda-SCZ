import type { APIRoute } from 'astro';
import { callApi } from '../../lib/api-server';

// Solo estas rutas de la API pueden alcanzarse desde el navegador a través del panel.
const ALLOWED = ['catalog/', 'inventory/', 'auth/me'];
const allowed = (path: string): boolean => ALLOWED.some((prefix) => path.startsWith(prefix));

// La clave de idempotencia de un movimiento de stock debe llegar tal cual a la API.
const idempotencyHeader = (request: Request): Record<string, string> => {
  const key = request.headers.get('idempotency-key');
  return key ? { 'Idempotency-Key': key } : {};
};

// Reenvía la petición a la API añadiendo el token de la sesión (que el navegador no ve).
const forward: APIRoute = async ({ params, request, locals }) => {
  const path = params.path ?? '';
  if (!allowed(path)) return Response.json({ message: 'Ruta no permitida' }, { status: 404 });
  const url = new URL(request.url);
  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(request.method);
  const body = hasBody ? await request.json().catch(() => undefined) : undefined;
  const result = await callApi(`/${path}${url.search}`, {
    method: request.method,
    token: locals.session?.token,
    body,
    headers: idempotencyHeader(request),
  });
  if (result.status === 204 || result.body === null) return new Response(null, { status: result.status });
  return Response.json(result.body, { status: result.status });
};

export const GET = forward;
export const POST = forward;
export const PATCH = forward;
export const DELETE = forward;
