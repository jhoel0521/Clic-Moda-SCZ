import { apiBase } from './api-server';

// /m/<id>/<formato>-<revisión>.<jpg|webp>: solo imágenes publicadas, nunca la copia maestra.
const MEDIA_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[a-z]+-\d+\.(jpg|webp)$/;

// Cabeceras de la respuesta de la API que la tienda reenvía tal cual (la caché la decide la API).
const FORWARDED = ['content-type', 'cache-control', 'etag', 'content-length'];

export const isMediaPath = (path: string): boolean => MEDIA_PATH.test(path);

const notFound = (): Response => new Response('No encontrado', { status: 404 });

// Reenvía la imagen desde la API (que a su vez la lee de SeaweedFS). Responde 404 ante cualquier
// ruta que no sea de una variante pública y 502 si la API no responde, sin detalles internos.
export async function proxyMedia(path: string, request: Request): Promise<Response> {
  if (!isMediaPath(path)) return notFound();
  const headers: Record<string, string> = {};
  const etag = request.headers.get('if-none-match');
  if (etag) headers['If-None-Match'] = etag;
  try {
    const upstream = await fetch(`${apiBase()}/public/media/${path}`, { headers });
    return new Response(upstream.status === 304 ? null : upstream.body, {
      status: upstream.status === 200 || upstream.status === 304 ? upstream.status : 404,
      headers: pick(upstream.headers),
    });
  } catch {
    return new Response('Imagen no disponible', { status: 502 });
  }
}

function pick(source: Headers): Headers {
  const out = new Headers();
  for (const name of FORWARDED) {
    const value = source.get(name);
    if (value) out.set(name, value);
  }
  return out;
}
