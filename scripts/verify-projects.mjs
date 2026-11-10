// Verifica que cada subproyecto cumpla el contrato que necesita el hook de commit (husky).
//
// Uso:  node scripts/verify-projects.mjs            errores = exit 1; "sin scaffolding" = aviso
//       node scripts/verify-projects.mjs --strict   también falla si algún proyecto es un placeholder
//
// Contrato de cada proyecto: scripts lint, test y build; eslint y prettier instalados como
// devDependencies; eslint.config.* con max-lines-per-function como error; .prettierrc;
// packageManager pnpm y engines de Node. El escáner de secretos es solo de la raíz.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PROJECTS = ['apps/shop', 'apps/admin', 'services/api'];
const REQUIRED_SCRIPTS = ['lint', 'test', 'build'];
const REQUIRED_DEV = ['eslint', 'prettier'];
const STRICT = process.argv.includes('--strict');

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const isPlaceholder = (pkg) => Object.values(pkg.scripts ?? {}).some((s) => /pendiente de scaffolding/.test(s));
const files = (dir) => (existsSync(dir) ? readdirSync(dir) : []);

function scriptProblems(pkg) {
  return REQUIRED_SCRIPTS.filter((s) => !pkg.scripts?.[s]).map((s) => `falta el script "${s}"`);
}

function toolProblems(pkg) {
  const dev = { ...pkg.devDependencies, ...pkg.dependencies };
  return REQUIRED_DEV.filter((d) => !dev[d]).map((d) => `falta ${d} en devDependencies`);
}

function configProblems(dir) {
  const out = [];
  const eslintCfg = files(dir).find((f) => f.startsWith('eslint.config.'));
  if (!eslintCfg) out.push('falta eslint.config.*');
  else if (!/max-lines-per-function['"]?\s*:\s*\[\s*['"]error/.test(readFileSync(join(dir, eslintCfg), 'utf8')))
    out.push('eslint.config.* no define max-lines-per-function como "error"');
  if (!files(dir).some((f) => f.startsWith('.prettierrc'))) out.push('falta .prettierrc');
  return out;
}

function metaProblems(pkg) {
  const out = [];
  if (!pkg.packageManager?.startsWith('pnpm@')) out.push('packageManager no es pnpm');
  if (!pkg.engines?.node) out.push('falta engines.node');
  return out;
}

function check(project) {
  const dir = join(ROOT, project);
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return { project, status: 'error', problems: ['no existe package.json'] };
  const pkg = readJson(file);
  if (isPlaceholder(pkg)) return { project, status: 'placeholder', problems: ['sin scaffolding (script de relleno)'] };
  const problems = [...scriptProblems(pkg), ...toolProblems(pkg), ...configProblems(dir), ...metaProblems(pkg)];
  return { project, status: problems.length ? 'error' : 'ok', problems };
}

function report({ project, status, problems }) {
  const icon = { ok: '✔', error: '✖', placeholder: '⚠' }[status];
  console.log(`${icon} ${project}${problems.length ? ': ' + problems.join('; ') : ''}`);
}

function main() {
  const results = PROJECTS.map(check);
  results.forEach(report);
  const failed = results.some((r) => r.status === 'error' || (STRICT && r.status === 'placeholder'));
  process.exitCode = failed ? 1 : 0;
}

main();
