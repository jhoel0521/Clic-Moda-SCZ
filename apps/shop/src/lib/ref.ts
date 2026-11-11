// Código de referencia de una venta (p. ej. ?ref=live-nov). Solo identifica el ENLACE, nunca a una persona.
export const REF_COOKIE = 'ref';
const REF_FORMAT = /^[a-z0-9_-]{1,32}$/;

// Minúsculas y formato válido; cualquier otra cosa se ignora (null).
export function normalizeRef(raw: string | null | undefined): string | null {
  const value = raw?.trim().toLowerCase() ?? '';
  return REF_FORMAT.test(value) ? value : null;
}

export interface RefDecision {
  /** Código vigente para esta visita (el del enlace, o el recordado en la cookie). */
  ref: string | null;
  /** Hay que guardar la cookie: el enlace trajo un código válido y distinto del recordado. */
  remember: boolean;
}

export function resolveRef(url: URL, cookieValue: string | undefined): RefDecision {
  const fromLink = normalizeRef(url.searchParams.get('ref'));
  const fromCookie = normalizeRef(cookieValue);
  if (fromLink) return { ref: fromLink, remember: fromLink !== fromCookie };
  return { ref: fromCookie, remember: false };
}
