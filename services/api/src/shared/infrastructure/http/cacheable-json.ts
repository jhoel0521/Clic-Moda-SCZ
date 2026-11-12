import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';

// 15 s en cada capa (aquí y en la tienda): un cambio llega a todos en 30 s como máximo.
export const PUBLIC_MAX_AGE_SECONDS = 15;

// ETag fuerte: huella del cuerpo exacto que se envía.
const etagOf = (body: string): string => `"${createHash('sha1').update(body).digest('hex')}"`;

// Responde JSON público con `ETag` y `Cache-Control: public, max-age=15`; 304 sin cuerpo si el ETag coincide.
export function sendCacheableJson(req: Request, res: Response, data: unknown): void {
  const body = JSON.stringify(data);
  const etag = etagOf(body);
  res.setHeader('Cache-Control', `public, max-age=${String(PUBLIC_MAX_AGE_SECONDS)}`);
  res.setHeader('ETag', etag);
  if (req.headers['if-none-match'] === etag) {
    res.status(304).end();
    return;
  }
  res.type('application/json').send(body);
}
