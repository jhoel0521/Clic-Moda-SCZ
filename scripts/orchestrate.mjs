// Orquestador del monorepo: infraestructura (Docker), base de datos y servidores de desarrollo.
//
//   node scripts/orchestrate.mjs ports
//   node scripts/orchestrate.mjs docker <up|down|logs|status|reset>
//   node scripts/orchestrate.mjs db <migrate|revert|status|seed|fresh|fresh-seed>
//   node scripts/orchestrate.mjs preflight
//   node scripts/orchestrate.mjs run <api|admin|shop> -- <comando...>
//
// Se invoca desde los scripts de package.json (pnpm docker:up, pnpm db:migrate, pnpm dev...).
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import net from 'node:net';
import { resolve } from 'node:path';
import { envFor, loadPorts, ROOT } from './ports.mjs';

const API_ENV = resolve(ROOT, 'services/api/.env');
const COMPOSE = ['compose', '-p', 'clic-moda', '--env-file', API_ENV, '-f', resolve(ROOT, 'docker-compose.dev.yml')];

function run(command, args, extraEnv = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    stdio: 'inherit',
    // Solo pnpm necesita el intérprete en Windows (es un .cmd); con shell los espacios de la ruta rompen los argumentos.
    shell: process.platform === 'win32' && command === 'pnpm',
    env: { ...process.env, ...extraEnv },
  });
  return result.status ?? 1;
}

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function printPorts(config) {
  console.log('Puertos de desarrollo (ports.json)\n');
  for (const [group, services] of [['infra', config.infra], ['apps', config.apps]]) {
    for (const [service, port] of Object.entries(services)) console.log(`  ${group.padEnd(6)} ${service.padEnd(10)} ${port}`);
  }
}

function docker(action, flags) {
  if (!existsSync(API_ENV)) fail('Falta services/api/.env: cópialo de services/api/.env.example y completa DB_PASSWORD.');
  const env = { DB_PORT: String(loadPorts().infra.postgres) };
  const commands = {
    up: ['up', '-d', '--wait'],
    down: ['down'],
    logs: ['logs', '-f', '--tail', '100'],
    status: ['ps'],
    reset: ['down', '-v'],
  };
  if (!commands[action]) fail(`docker: acción desconocida "${action}" (up, down, logs, status, reset)`);
  if (action === 'reset' && !flags.includes('--yes')) {
    fail('docker:reset BORRA los datos de la base de desarrollo. Repite con --yes si es lo que quieres.');
  }
  const code = run('docker', [...COMPOSE, ...commands[action]], env);
  if (code === 0 && action === 'up') console.log(`\n✔ Postgres en localhost:${env.DB_PORT}`);
  return code;
}

function assertSafeToDrop() {
  const host = process.env.DB_HOST ?? 'localhost';
  if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1'].includes(host)) {
    fail(`Me niego a borrar la base de datos (NODE_ENV=${process.env.NODE_ENV}, DB_HOST=${host}): solo en desarrollo local.`);
  }
}

// Si no hay contraseña de Gerente configurada, se genera una al azar y se muestra UNA vez
// (nunca hay una contraseña por defecto en el repositorio).
function seedEnv() {
  if (process.env.INITIAL_MANAGER_PASSWORD) return {};
  const password = randomBytes(15).toString('base64url');
  const email = process.env.INITIAL_MANAGER_EMAIL || 'gerente@clicmoda.local';
  console.log(`Gerente de desarrollo → ${email} / ${password}   (solo se muestra ahora)`);
  return { INITIAL_MANAGER_EMAIL: email, INITIAL_MANAGER_PASSWORD: password };
}

function db(action) {
  const api = (script, extra = {}) => run('pnpm', ['--dir', 'services/api', script], { ...envFor('api'), ...extra });
  const steps = {
    migrate: () => api('migration:run'),
    revert: () => api('migration:revert'),
    status: () => api('migration:show'),
    seed: () => api('seed:manager', seedEnv()),
    fresh: () => (assertSafeToDrop(), api('db:drop') || api('migration:run')),
    'fresh-seed': () => (assertSafeToDrop(), api('db:drop') || api('migration:run') || api('seed:manager', seedEnv())),
  };
  if (!steps[action]) fail(`db: acción desconocida "${action}" (${Object.keys(steps).join(', ')})`);
  return steps[action]();
}

const isOpen = (port) =>
  new Promise((done) => {
    const socket = net.connect({ port, host: '127.0.0.1', timeout: 1000 });
    socket.once('connect', () => (socket.destroy(), done(true)));
    socket.once('error', () => done(false));
    socket.once('timeout', () => (socket.destroy(), done(false)));
  });

async function preflight(config) {
  const problems = [];
  if (!(await isOpen(config.infra.postgres))) problems.push(`Postgres no responde en el puerto ${config.infra.postgres}: ejecuta "pnpm docker:up".`);
  for (const [service, port] of Object.entries(config.apps)) {
    if (await isOpen(port)) problems.push(`El puerto ${port} (${service}) ya está en uso: cierra lo que lo ocupa.`);
  }
  problems.forEach((problem) => console.error(`✖ ${problem}`));
  return problems.length === 0 ? 0 : 1;
}

function runWithEnv(service, rest) {
  const separator = rest.indexOf('--');
  const command = rest.slice(separator + 1);
  if (command.length === 0) fail('run: falta el comando (node scripts/orchestrate.mjs run api -- <comando>)');
  return run(command[0], command.slice(1), envFor(service));
}

async function main() {
  const [command, action, ...rest] = process.argv.slice(2);
  const config = loadPorts();
  const handlers = {
    ports: () => (printPorts(config), 0),
    docker: () => docker(action, rest),
    db: () => db(action),
    preflight: () => preflight(config),
    run: () => runWithEnv(action, rest),
  };
  if (!handlers[command]) fail(`Comando desconocido "${command}". Usa: ${Object.keys(handlers).join(', ')}`);
  return handlers[command]();
}

main().then((code) => process.exit(code), (error) => fail(error.message));
