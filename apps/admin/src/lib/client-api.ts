// Cliente del navegador: llama a las rutas /api/* del propio panel (que reenvían a la API con el token).
export interface FieldIssue {
  field: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly issues: FieldIssue[] = []
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

const issuesOf = (body: unknown): FieldIssue[] => {
  const issues = (body as { issues?: unknown } | null)?.issues;
  return Array.isArray(issues) ? (issues as FieldIssue[]) : [];
};

const messageOf = (body: unknown, fallback: string): string => {
  const message = (body as { message?: unknown } | null)?.message;
  if (Array.isArray(message)) return message.join('. ');
  return typeof message === 'string' && message ? message : fallback;
};

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Cierra una respuesta: sesión vencida lleva al inicio de sesión y un error se convierte en ApiError.
async function settle<T>(response: Response, path: string): Promise<T> {
  const data = await readBody(response);
  if (response.status === 401 && typeof window !== 'undefined' && path !== 'login') {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`);
  }
  if (!response.ok) {
    throw new ApiError(response.status, messageOf(data, 'No se pudo completar la acción'), issuesOf(data));
  }
  return data as T;
}

// Sube un formulario con archivos (multipart): el navegador pone el tipo y el límite del cuerpo.
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  return settle<T>(await fetch(`/api/${path}`, { method: 'POST', body: form }), path);
}

export async function api<T>(
  method: Method,
  path: string,
  body?: unknown,
  extraHeaders?: Record<string, string>
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method,
    headers: body === undefined ? extraHeaders : { 'Content-Type': 'application/json', ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return settle<T>(response, path);
}
