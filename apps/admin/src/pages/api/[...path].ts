import type { APIRoute } from 'astro';
import { callApi, fetchRaw } from '../../lib/api-server';

// Solo estas rutas de la API pueden alcanzarse desde el navegador a través del panel.
const ALLOWED = ['catalog/', 'inventory/', 'auth/me'];
// La configuración de la tienda es una sola ruta exacta (GET público y PUT del Gerente).
const isSettings = (path: string): boolean => path === 'store-settings';

// Las imágenes viajan sin interpretar: se suben como multipart y se devuelven como bytes.
// Cuenta solo `media` exacto o `media/...` (no cualquier ruta que empiece por "media").
const isMedia = (path: string): boolean =>
  path === 'media' || path.startsWith('media/') || path.startsWith('public/media/');
const allowed = (path: string): boolean =>
  isMedia(path) || isSettings(path) || ALLOWED.some((prefix) => path.startsWith(prefix));
const MEDIA_RESPONSE_HEADERS = ['content-type', 'cache-control', 'etag'];

// La clave de idempotencia de un movimiento de stock debe llegar tal cual a la API.
const idempotencyHeader = (request: Request): Record<string, string> => {
  const key = request.headers.get('idempotency-key');
  return key ? { 'Idempotency-Key': key } : {};
};

const hasBody = (method: string): boolean => !['GET', 'HEAD', 'DELETE'].includes(method);

// Reenvía imágenes (subida multipart, JSON de encuadre y bytes de vuelta) con el token de la sesión.
async function forwardMedia(path: string, request: Request, token: string | undefined): Promise<Response> {
  const headers: Record<string, string> = {};
  for (const name of ['content-type', 'if-none-match']) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  const body = hasBody(request.method) ? await request.arrayBuffer() : undefined;
  const search = new URL(request.url).search;
  const upstream = await fetchRaw(`/${path}${search}`, { method: request.method, token, headers, body });
  const out = new Headers();
  for (const name of MEDIA_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }
  const empty = upstream.status === 204 || upstream.status === 304;
  return new Response(empty ? null : upstream.body, { status: upstream.status, headers: out });
}

// Reenvía la petición a la API añadiendo el token de la sesión (que el navegador no ve).
const forward: APIRoute = async ({ params, request, locals }) => {
  const path = params.path ?? '';
  if (!allowed(path)) return Response.json({ message: 'Ruta no permitida' }, { status: 404 });
  if (isMedia(path)) return forwardMedia(path, request, locals.session?.token);
  const url = new URL(request.url);
  const body = hasBody(request.method) ? await request.json().catch(() => undefined) : undefined;
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
export const PUT = forward;
export const PATCH = forward;
export const DELETE = forward;
