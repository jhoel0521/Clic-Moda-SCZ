// Verifica que cada subproyecto cumpla el contrato que necesita el hook de commit (husky).
//
// Uso:  node scripts/verify-projects.mjs            errores = exit 1; "sin scaffolding" = aviso
//       node scripts/verify-projects.mjs --strict   también falla si algún proyecto es un placeholder
//
// El orquestador NO conoce las herramientas internas de cada proyecto (ESLint, oxlint, Prettier...):
// solo llama a scripts con un nombre fijo. Contrato de cada proyecto:
//   - scripts: lint, test, build y format
//   - la regla max-lines-per-function (máx. 25) como error, en el motor que use (ESLint u oxlint)
//   - packageManager pnpm y engines.node
// El escáner de secretos es único y vive en la raíz.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const PROJECTS = ['apps/shop', 'apps/admin', 'services/api'];
const REQUIRED_SCRIPTS = ['lint', 'test', 'build', 'format'];
const STRICT = process.argv.includes('--strict');
const RULE_AS_ERROR = /max-lines-per-function['"]?\s*:\s*(\[\s*)?['"]error/;
const LINT_CONFIGS = [/^eslint\.config\./, /^\.oxlintrc\.json$/];

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'));
const isPlaceholder = (pkg) =>
  Object.values(pkg.scripts ?? {}).some((s) => /pendiente de scaffolding/.test(s));

function scriptProblems(pkg) {
  return REQUIRED_SCRIPTS.filter((s) => !pkg.scripts?.[s]).map((s) => `falta el script "${s}"`);
}

function lintRuleProblems(dir) {
  const configs = readdirSync(dir).filter((f) => LINT_CONFIGS.some((re) => re.test(f)));
  if (!configs.length) return ['falta la configuración del linter (eslint.config.* o .oxlintrc.json)'];
  const ok = configs.some((f) => RULE_AS_ERROR.test(readFileSync(join(dir, f), 'utf8')));
  return ok ? [] : ['el linter no define max-lines-per-function como "error"'];
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
  if (isPlaceholder(pkg)) {
    return { project, status: 'placeholder', problems: ['sin scaffolding (script de relleno)'] };
  }
  const problems = [...scriptProblems(pkg), ...lintRuleProblems(dir), ...metaProblems(pkg)];
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
