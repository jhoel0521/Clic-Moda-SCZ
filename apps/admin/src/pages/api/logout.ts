import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '../../lib/session';

export const POST: APIRoute = ({ cookies }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return Response.json({ ok: true });
};
