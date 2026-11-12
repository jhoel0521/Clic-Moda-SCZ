// Fotos de desarrollo: sube las imágenes de una carpeta a los productos, por la API (como el panel).
//
//   pnpm db:seed:photos -- <carpeta> [--dry] [--force]
//
// Los archivos se llaman <slug>-<n>.jpg|png|webp (bota-andes-1.jpg, bota-andes-2.jpg…). La foto 1 es la
// principal. Por omisión no toca productos que ya tienen fotos (--force las reemplaza); --dry solo muestra
// el plan. Hace falta el Gerente: PHOTOS_EMAIL y PHOTOS_PASSWORD (la contraseña no se guarda en el repo).
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadPorts } from './ports.mjs';
import { applyPlan, groupBySlug, listProducts, login, plan } from './lib/seed-photos.mjs';

const fail = (message) => (console.error(`✖ ${message}`), process.exit(1));

function options(argv) {
  const flags = new Set(argv.filter((arg) => arg.startsWith('--')));
  const folder = argv.find((arg) => !arg.startsWith('--'));
  if (!folder) fail('Falta la carpeta: pnpm db:seed:photos -- <carpeta> [--dry] [--force]');
  return { folder: resolve(folder), dry: flags.has('--dry'), force: flags.has('--force') };
}

function credentials() {
  const { PHOTOS_EMAIL: email, PHOTOS_PASSWORD: password } = process.env;
  if (!email || !password) fail('Define PHOTOS_EMAIL y PHOTOS_PASSWORD (el Gerente de desarrollo).');
  return { email, password };
}

function show(items) {
  for (const { slug, files, skip } of items) {
    console.log(`${skip ? '–' : '✔'} ${slug}: ${files.length} foto(s)${skip ? ` — se omite: ${skip}` : ''}`);
  }
}

async function main() {
  const { folder, dry, force } = options(process.argv.slice(2));
  const api = process.env.API_URL ?? `http://localhost:${loadPorts().apps?.api ?? 10010}`;
  const groups = groupBySlug(readdirSync(folder));
  if (groups.size === 0) fail(`No hay archivos con el formato <slug>-<n>.jpg en ${folder}`);
  const ctx = { api, fetcher: fetch };
  const token = await login({ ...ctx, ...credentials() });
  const items = plan(groups, await listProducts({ ...ctx, token }), { force });
  show(items);
  if (dry) return console.log('Prueba (--dry): no se subió nada.');
  for (const item of items.filter((entry) => entry.product)) {
    const count = await applyPlan({ ...ctx, token }, item, (name) => readFileSync(resolve(folder, name)));
    console.log(`↑ ${item.slug}: ${count} foto(s) subidas y asignadas`);
  }
}

main().catch((error) => fail(error instanceof Error ? error.message : String(error)));
