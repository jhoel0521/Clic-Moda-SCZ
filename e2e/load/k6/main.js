import { login } from './lib.js';
import { read, readOptions, readThresholds } from './read.js';
import { idempotency, idempotencyOptions, withdraw, writeOptions, writeSetup, writeThresholds } from './write.js';

export { read, withdraw, idempotency };

// SCENARIO = read | write | all. Percentiles que se reportan: mediana, p90, p95 y p99 (y el máximo).
const wanted = __ENV.SCENARIO || 'all';
const useRead = wanted === 'read' || wanted === 'all';
const useWrite = wanted === 'write' || wanted === 'all';

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  scenarios: {
    ...(useRead ? { read: readOptions } : {}),
    ...(useWrite ? { withdraw: writeOptions, idempotency: idempotencyOptions } : {}),
  },
  thresholds: {
    ...(useRead ? readThresholds : {}),
    ...(useWrite ? writeThresholds : {}),
  },
};

export function setup() {
  const token = login();
  return { token, ...(useWrite ? writeSetup(token) : {}) };
}
