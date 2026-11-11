// Arranca la API para las pruebas de flujos con su PROPIA base (clic_moda_flows) dentro del Postgres de Docker
// del proyecto: nunca toca los datos de desarrollo. Lo ejecuta Playwright como webServer.
//   Requiere: pnpm docker:up  (Postgres arriba)  y services/api/.env
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const api = join(root, 'services', 'api');
process.loadEnvFile(join(api, '.env'));

export const DB = 'clic_moda_flows';
const PASSWORD = 'FlowsTestPassword1';
const MANAGER = 'gerente@flows.local';
const STAFF = [
  ['despacho@flows.local', 'Despacho', 'DESPACHO'],
  ['atencion@flows.local', 'Atención', 'ATENCION'],
];
// Las imágenes de los flujos van a disco (no a SeaweedFS): no mezclan archivos con los de desarrollo.
const env = {
  ...process.env,
  DB_NAME: DB,
  DB_HOST: 'localhost',
  PORT: '10018',
  INITIAL_MANAGER_PASSWORD: PASSWORD,
  MEDIA_STORAGE: 'disk',
  MEDIA_DISK_DIR: '.media-flows',
};

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: api,
    env,
    stdio: 'inherit',
    shell: command === 'pnpm' && process.platform === 'win32', // solo pnpm necesita shell en Windows
    ...options,
  });
  if (result.status !== 0) throw new Error(`Falló: ${command} ${args.join(' ')}`);
}

function ensureDatabase() {
  const psql = ['exec', 'clic-moda-postgres', 'psql', '-U', process.env.DB_USER, '-d', 'postgres', '-tA'];
  const exists = spawnSync('docker', [...psql, '-c', `SELECT 1 FROM pg_database WHERE datname='${DB}'`], {
    encoding: 'utf8',
  });
  if (exists.status !== 0)
    throw new Error('Docker no responde: ejecuta "pnpm docker:up" antes de las pruebas de flujos.');
  if (!exists.stdout.trim()) run('docker', [...psql, '-c', `CREATE DATABASE ${DB}`]);
}

// La CLI solo siembra al Gerente (aún no hay alta de personal): Despacho y Atención se crean con la misma
// contraseña copiando su hash en la base de pruebas y se les asigna el rol con la CLI real.
function seedUsers() {
  run('node', ['dist/identity/infrastructure/cli/seed-manager.js'], {
    env: { ...env, INITIAL_MANAGER_EMAIL: MANAGER },
  });
  for (const [email, name, role] of STAFF) {
    const insert = `INSERT INTO users (id, email, name, email_verified, password_hash) SELECT gen_random_uuid(), '${email}', '${name}', true, password_hash FROM users WHERE email = '${MANAGER}' ON CONFLICT (email) DO NOTHING`;
    run('docker', ['exec', 'clic-moda-postgres', 'psql', '-U', process.env.DB_USER, '-d', DB, '-c', insert]);
    run('node', ['dist/identity/infrastructure/cli/assign-roles.js', '--email', email, '--roles', role, '--yes']);
  }
}

ensureDatabase();
run('pnpm', ['build']);
run('node', [
  'node_modules/typeorm/cli.js',
  'migration:run',
  '-d',
  'dist/shared/infrastructure/database/data-source.js',
]);
seedUsers();
const server = spawn('node', ['dist/main.js'], { cwd: api, env, stdio: 'inherit' });
server.on('exit', (code) => process.exit(code ?? 0));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill());
