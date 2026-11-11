import type { APIRoute } from 'astro';
import { proxyMedia } from '../../lib/media-proxy';

// Las imágenes se sirven bajo el dominio de la tienda (sin CORS y sin exponer la API ni el almacenamiento):
// navegador → tienda (esta ruta) → API → SeaweedFS.
export const GET: APIRoute = ({ params, request }) => proxyMedia(params.path ?? '', request);
