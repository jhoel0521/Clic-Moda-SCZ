import http from 'k6/http';
import { check, fail } from 'k6';

export const BASE = __ENV.BASE_URL || 'http://localhost:10010';

// Inicia sesión una sola vez por corrida (el límite de intentos de la API protege el login).
export function login() {
  const res = http.post(
    `${BASE}/auth/login`,
    JSON.stringify({ email: __ENV.MANAGER_EMAIL, password: __ENV.MANAGER_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } }
  );
  if (!check(res, { 'login 200': (r) => r.status === 200 })) fail(`login falló: ${res.status} ${res.body}`);
  return res.json('accessToken');
}

export const headers = (token, extra = {}) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  ...extra,
});

export function get(path, token, endpoint) {
  return http.get(`${BASE}${path}`, { headers: headers(token), tags: { endpoint } });
}

export function post(path, body, token, endpoint, extra = {}) {
  return http.post(`${BASE}${path}`, JSON.stringify(body), { headers: headers(token, extra), tags: { endpoint } });
}
