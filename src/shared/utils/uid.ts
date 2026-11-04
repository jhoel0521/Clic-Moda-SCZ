/** Identificador corto para datos de la demo. Funciona también en Safari antiguo y sin HTTPS. */
export function uid(length = 16): string {
  let out = '';
  while (out.length < length) out += Math.random().toString(16).slice(2);
  return out.slice(0, length);
}
