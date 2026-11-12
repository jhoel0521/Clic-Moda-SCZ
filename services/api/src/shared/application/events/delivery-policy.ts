// Reintentos de una entrega: máximo de intentos, espera creciente entre ellos y el plazo que dura el
// «reclamo» de una entrega mientras un despachador la ejecuta (si cae, otro la retoma al vencer).
export const DELIVERY_POLICY = {
  maxAttempts: 5,
  backoffMs: (attempt: number): number => 500 * 2 ** (attempt - 1),
  leaseMs: 30_000,
} as const;

export type FailureOutcome =
  | { readonly status: 'pending'; readonly retryAt: Date }
  | { readonly status: 'needs_review'; readonly retryAt: null };

// Qué pasa tras un intento fallido: reprogramar con espera creciente o, al agotar los intentos, pasar a
// «necesita revisión» (nadie la intenta más hasta que el Gerente la reintente).
export function afterFailure(attempts: number, now: Date): FailureOutcome {
  if (attempts >= DELIVERY_POLICY.maxAttempts) return { status: 'needs_review', retryAt: null };
  return {
    status: 'pending',
    retryAt: new Date(now.getTime() + DELIVERY_POLICY.backoffMs(attempts)),
  };
}
