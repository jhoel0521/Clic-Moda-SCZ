// Cliente de la API del lado del servidor: nunca se ejecuta en el navegador.
export const apiBase = (): string =>
  (import.meta.env.API_URL ?? process.env.API_URL ?? 'http://localhost:10010').replace(/\/$/, '');

export interface ApiResult {
  status: number;
  body: unknown;
}

interface CallOptions {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

// Llama a la API y devuelve estado y cuerpo ya interpretado (JSON si lo hay).
export async function callApi(path: string, options: CallOptions = {}): Promise<ApiResult> {
  const headers: Record<string, string> = { Accept: 'application/json', ...options.headers };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${apiBase()}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const text = await response.text();
  return { status: response.status, body: text ? safeJson(text) : null };
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

interface RawOptions {
  method: string;
  token?: string;
  headers?: Record<string, string>;
  body?: ArrayBuffer;
}

// Igual que callApi pero sin interpretar la respuesta: sirve para subir archivos (multipart) y para
// devolver imágenes (binario) sin tocar los bytes.
export async function fetchRaw(path: string, options: RawOptions): Promise<Response> {
  const headers: Record<string, string> = { ...options.headers };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  return fetch(`${apiBase()}${path}`, { method: options.method, headers, body: options.body });
}
