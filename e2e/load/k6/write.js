import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import { BASE, get, headers, post } from './lib.js';

const STOCK = 5; // unidades que existen
const WITHDRAWALS = 60; // salidas de 1 unidad, simultáneas

export const applied = new Counter('stock_applied');
export const rejected = new Counter('stock_rejected');
export const finalState = new Trend('stock_time_to_final_state', true);

// Escritura: nunca se vende de más (60 salidas contra 5 unidades) y la misma clave repetida crea 1 comando.
export const writeOptions = {
  executor: 'shared-iterations',
  exec: 'withdraw',
  vus: 20,
  iterations: WITHDRAWALS,
  maxDuration: '2m',
};

export const idempotencyOptions = {
  executor: 'per-vu-iterations',
  exec: 'idempotency',
  vus: 1,
  iterations: 1,
  maxDuration: '1m',
  startTime: '1s',
};

export const writeThresholds = {
  stock_applied: [`count==${STOCK}`],
  stock_rejected: [`count==${WITHDRAWALS - STOCK}`],
  'http_req_duration{endpoint:enqueue}': ['p(95)<800', 'p(99)<1500'],
  stock_time_to_final_state: ['p(95)<5000', 'p(99)<10000'],
  checks: ['rate>0.99'],
};

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

function createVariant(token, tag) {
  const category = post('/catalog/categories', { name: `Carga ${tag}` }, token, 'setup').json();
  const variants = [{ size: '38', color: 'Negro', price: '100.00' }];
  const body = { categoryId: category.id, name: `Modelo carga ${tag}`, variants };
  return post('/catalog/products', body, token, 'setup').json('variants.0.id');
}

function waitFor(token, id, seconds = 30) {
  for (let i = 0; i < seconds * 5; i += 1) {
    const command = get(`/inventory/commands/${id}`, token, 'command').json();
    if (command.status !== 'PENDING') return command;
    sleep(0.2);
  }
  return { status: 'PENDING' };
}

export function writeSetup(token) {
  const variantId = createVariant(token, unique());
  const body = { variantId, type: 'RECEIVE', units: STOCK, reason: 'Ingreso inicial' };
  const res = post('/inventory/commands', body, token, 'setup', { 'Idempotency-Key': `rcv-${unique()}` });
  waitFor(token, res.json('id'));
  return { variantId };
}

export function withdraw(data) {
  const token = data.token;
  const started = Date.now();
  const body = { variantId: data.variantId, type: 'WITHDRAW', units: 1, reason: 'Venta de prueba' };
  const res = post('/inventory/commands', body, token, 'enqueue', { 'Idempotency-Key': `wd-${unique()}` });
  if (!check(res, { 'encolado 202': (r) => r.status === 202 })) return;
  const done = waitFor(token, res.json('id'));
  finalState.add(Date.now() - started);
  (done.status === 'APPLIED' ? applied : rejected).add(1);
}

// 50 envíos en paralelo con la MISMA clave: debe existir un solo comando.
export function idempotency(data) {
  const token = data.token;
  const key = `same-${unique()}`;
  const variantId = createVariant(token, `idem-${unique()}`);
  const body = JSON.stringify({ variantId, type: 'RECEIVE', units: 1, reason: 'Reintento' });
  const options = { headers: headers(token, { 'Idempotency-Key': key }), tags: { endpoint: 'idempotent' } };
  const requests = Array.from({ length: 50 }, () => ['POST', `${BASE}/inventory/commands`, body, options]);
  const ids = new Set(http.batch(requests).map((r) => r.json('id')));
  check(ids, { '50 envíos con la misma clave = 1 comando': (set) => set.size === 1 });
}
