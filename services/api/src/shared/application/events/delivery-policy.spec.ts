import { afterFailure, DELIVERY_POLICY } from './delivery-policy.js';

const NOW = new Date('2026-11-12T10:00:00Z');

describe('afterFailure', () => {
  it('reprograma con una espera que crece en cada intento', () => {
    const waits = [1, 2, 3, 4].map((attempt) => {
      const outcome = afterFailure(attempt, NOW);
      return outcome.status === 'pending' ? outcome.retryAt.getTime() - NOW.getTime() : -1;
    });

    expect(waits).toEqual([500, 1000, 2000, 4000]);
  });

  it('al llegar al máximo de intentos pasa a necesita revisión y no se reprograma', () => {
    expect(afterFailure(DELIVERY_POLICY.maxAttempts, NOW)).toEqual({
      status: 'needs_review',
      retryAt: null,
    });
    expect(afterFailure(DELIVERY_POLICY.maxAttempts - 1, NOW).status).toBe('pending');
  });
});
