// Carga y VALIDA el mapa de puertos (ports.json): cada puerto dentro de su rango y sin repetirse.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const ROOT = resolve(import.meta.dirname, '..');

const inRange = (port, [low, high]) => Number.isInteger(port) && port >= low && port <= high;

function check(group, name, ports, range) {
  for (const [service, port] of Object.entries(ports)) {
    if (!inRange(port, range)) {
      throw new Error(`ports.json: ${group}.${service}=${port} está fuera del rango ${range[0]}-${range[1]}`);
    }
    name.push([service, port]);
  }
}

export function loadPorts() {
  const config = JSON.parse(readFileSync(resolve(ROOT, 'ports.json'), 'utf8'));
  const all = [];
  check('infra', all, config.infra, config.ranges.infra);
  check('apps', all, config.apps, config.ranges.apps);
  const seen = new Map();
  for (const [service, port] of all) {
    if (seen.has(port)) throw new Error(`ports.json: el puerto ${port} lo usan ${seen.get(port)} y ${service}`);
    seen.set(port, service);
  }
  return config;
}

// Variables de entorno que recibe cada servicio, derivadas de ports.json.
export function envFor(service, config = loadPorts()) {
  const api = `http://localhost:${config.apps.api}`;
  const s3 = `http://127.0.0.1:${config.infra.seaweedfs}`;
  const common = {
    DB_HOST: 'localhost',
    DB_PORT: String(config.infra.postgres),
    S3_ENDPOINT: s3,
    API_URL: api,
  };
  return service in config.apps ? { ...common, PORT: String(config.apps[service]) } : common;
}
