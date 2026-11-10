// Sesión del panel: se guarda en una cookie httpOnly, así el JavaScript del navegador nunca ve el token.
export const SESSION_COOKIE = 'clic_admin_session';

export type RoleName = 'GERENTE' | 'DESPACHO' | 'ATENCION';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  roles: RoleName[];
}

export interface Session {
  token: string;
  user: SessionUser;
  expiresAt: number; // milisegundos desde 1970
}

export const encodeSession = (session: Session): string =>
  encodeURIComponent(JSON.stringify(session));

const isSession = (value: unknown): value is Session => {
  const session = value as Session;
  return (
    typeof session?.token === 'string' &&
    typeof session.expiresAt === 'number' &&
    Array.isArray(session.user?.roles)
  );
};

// Lee la cookie; devuelve null si falta, está mal formada o ya venció.
export function readSession(raw: string | undefined, now: number = Date.now()): Session | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    return isSession(parsed) && parsed.expiresAt > now ? parsed : null;
  } catch {
    return null;
  }
}

// Qué puede hacer cada rol: el Gerente todo; Despacho opera el almacén; Atención solo consulta.
export type Permission = 'catalog:write' | 'stock:write';

const GRANTS: Record<Permission, RoleName[]> = {
  'catalog:write': ['GERENTE'],
  'stock:write': ['GERENTE', 'DESPACHO'],
};

export const can = (session: Session | null, permission: Permission): boolean =>
  !!session && session.user.roles.some((role) => GRANTS[permission].includes(role));

// Solo rutas internas: evita que "next" lleve a un sitio externo tras iniciar sesión.
export const safeNext = (next: string | null | undefined): string =>
  next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
