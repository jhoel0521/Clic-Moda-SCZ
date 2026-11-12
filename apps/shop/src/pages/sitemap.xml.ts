import type { APIRoute } from 'astro';
import { CatalogUnavailableError, catalog, type SlugEntry } from '../lib/catalog';
import { siteOrigin } from '../lib/seo';
import { buildSitemap } from '../lib/sitemap';

export const GET: APIRoute = async ({ url }) => {
  let slugs: SlugEntry[] = [];
  try {
    slugs = await catalog.slugs();
  } catch (error) {
    // Sin catálogo se publica solo lo fijo: mejor un sitemap corto que un error para el rastreador.
    if (!(error instanceof CatalogUnavailableError)) throw error;
  }
  return new Response(buildSitemap(siteOrigin(url.origin), slugs), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900',
    },
  });
};
