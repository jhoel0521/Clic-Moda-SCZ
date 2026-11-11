import { vi } from 'vitest';

export interface FakeRequest {
  method: string;
  path: string;
  query: URLSearchParams;
  body: unknown;
  headers: Record<string, string>;
}

type Reply = { status?: number; body?: unknown };
// Una ruta es un valor fijo o una función que ve la petición.
type Handler = ((request: FakeRequest) => unknown) | unknown;

// Solo es una respuesta HTTP si trae 'body' o un 'status' numérico (un comando con status 'APPLIED' es un dato).
const isReply = (value: unknown): value is Reply => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  return 'body' in value || typeof (value as Reply).status === 'number';
};

function resolve(handler: Handler, request: FakeRequest): unknown {
  if (handler === undefined) return { status: 404, body: { message: 'Ruta no simulada' } };
  return typeof handler === 'function' ? handler(request) : handler;
}

function toRequest(input: string, init: RequestInit): FakeRequest {
  const url = new URL(input, 'http://panel.test');
  return {
    method: init.method ?? 'GET',
    path: url.pathname.replace(/^\/api\//, ''),
    query: url.searchParams,
    body: init.body ? JSON.parse(String(init.body)) : undefined,
    headers: (init.headers ?? {}) as Record<string, string>,
  };
}

function toResponse(result: unknown): Response {
  const reply = isReply(result) ? result : { body: result };
  const body = reply.body === undefined ? null : JSON.stringify(reply.body);
  return new Response(body, { status: reply.status ?? 200 });
}

// API simulada: rutas "MÉTODO ruta" (sin /api/ ni parámetros). Devuelve todas las llamadas recibidas.
export function fakeApi(routes: Record<string, Handler>): FakeRequest[] {
  const calls: FakeRequest[] = [];
  const handle = async (input: string, init: RequestInit = {}) => {
    const request = toRequest(input, init);
    calls.push(request);
    return toResponse(resolve(routes[`${request.method} ${request.path}`], request));
  };
  vi.stubGlobal('fetch', vi.fn(handle));
  return calls;
}
