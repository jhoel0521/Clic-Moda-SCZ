import type { APIRoute } from 'astro';
import { siteOrigin } from '../lib/seo';
import { buildRobots } from '../lib/sitemap';

export const GET: APIRoute = ({ url }) =>
  new Response(buildRobots(siteOrigin(url.origin)), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
