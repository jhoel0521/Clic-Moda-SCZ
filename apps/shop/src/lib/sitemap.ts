import type { SlugEntry } from './catalog';
import { productUrl } from './inquiry';

const escapeXml = (text: string): string =>
  text.replace(/[<>&'"]/g, (char) => `&#${String(char.charCodeAt(0))};`);

const STATIC_PATHS = ['/', '/catalogo', '/contacto'];

const urlEntry = (loc: string, lastmod?: string): string =>
  `<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : ''}</url>`;

// sitemap.xml: portada, catálogo, contacto y cada producto publicado con su fecha de actualización.
export function buildSitemap(origin: string, slugs: readonly SlugEntry[]): string {
  const base = origin.endsWith('/') ? origin : `${origin}/`;
  const fixed = STATIC_PATHS.map((path) => urlEntry(new URL(path, base).toString()));
  const products = slugs.map((item) => urlEntry(productUrl(origin, item.slug), item.updatedAt));
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...fixed, ...products].join('')}</urlset>`;
}

export const buildRobots = (origin: string): string =>
  `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', origin.endsWith('/') ? origin : `${origin}/`).toString()}\n`;
