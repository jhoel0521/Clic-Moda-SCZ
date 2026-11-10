import { check, sleep } from 'k6';
import { get } from './lib.js';

// Lectura: lo que hace el personal con el inventario abierto (listar, buscar, resumen, matriz).
export const readOptions = {
  executor: 'ramping-vus',
  exec: 'read',
  startVUs: 0,
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 15 },
    { duration: '30s', target: 30 },
    { duration: '15s', target: 0 },
  ],
  gracefulRampDown: '5s',
};

export const readThresholds = {
  'http_req_duration{endpoint:products}': ['p(95)<600', 'p(99)<1200'],
  'http_req_duration{endpoint:summary}': ['p(95)<400', 'p(99)<800'],
  'http_req_duration{endpoint:stock}': ['p(95)<600', 'p(99)<1200'],
  'http_req_failed{scenario:read}': ['rate<0.01'],
};

export function read(data) {
  const token = data.token;
  const pages = [
    get('/catalog/products?page=1&pageSize=10', token, 'products'),
    get('/inventory/summary', token, 'summary'),
    get('/inventory/stock?page=1&pageSize=10&byProduct=true', token, 'stock'),
    get('/catalog/products?page=1&pageSize=10&text=bota', token, 'products'),
  ];
  check(pages, { 'todas 200': (all) => all.every((r) => r.status === 200) });
  sleep(1);
}
