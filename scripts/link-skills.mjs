// Organiza las skills de agentes: agent/skills/ es la fuente de verdad (versionada) y
// .claude/skills/ y .agents/skills/ son enlaces locales hacia ella (no se versionan).
//
// Uso:  node scripts/link-skills.mjs            crea/repara enlaces y adopta skills sueltas
//       node scripts/link-skills.mjs --check    solo informa, no cambia nada (sale 1 si hay algo pendiente)
//
// Una skill "suelta" es una carpeta real en .claude/skills o .agents/skills (p. ej. recién
// instalada con `npx skills add`): se mueve a agent/skills y se reemplaza por un enlace.
// Si ya existe en agent/skills con contenido distinto NO se toca nada: se avisa del conflicto.
import {
  cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync,
  realpathSync, rmSync, symlinkSync, unlinkSync,
} from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..');
const SOURCE = join(ROOT, 'agent', 'skills');
// Orden importa: .agents primero, porque .claude de la CLI de skills apunta a .agents.
const TARGETS = ['.agents/skills', '.claude/skills'].map((t) => join(ROOT, t));
const CHECK_ONLY = process.argv.includes('--check');

const stat = (p) => lstatSync(p, { throwIfNoEntry: false });
const isLink = (p) => stat(p)?.isSymbolicLink() ?? false;
const dirs = (p) => (existsSync(p) ? readdirSync(p).filter((n) => !n.startsWith('.')) : []);

function sameTree(a, b) {
  const [la, lb] = [readdirSync(a).sort(), readdirSync(b).sort()];
  if (la.join('|') !== lb.join('|')) return false;
  return la.every((n) => {
    const [pa, pb] = [join(a, n), join(b, n)];
    return stat(pa).isDirectory() ? sameTree(pa, pb) : readFileSync(pa).equals(readFileSync(pb));
  });
}

function removeLink(path) {
  try { unlinkSync(path); } catch { rmSync(path, { recursive: false, force: true }); }
}

function makeLink(path, source) {
  mkdirSync(join(path, '..'), { recursive: true });
  if (process.platform === 'win32') symlinkSync(source, path, 'junction'); // sin admin
  else symlinkSync(relative(join(path, '..'), source), path, 'dir');
}

function linkedTo(path, source) {
  return isLink(path) && existsSync(path) && realpathSync(path) === realpathSync(source);
}

// Devuelve 'ok' | 'linked' | 'conflict' | 'pending' (pending = haría falta actuar en --check).
function ensure(target, name) {
  const [path, source] = [join(target, name), join(SOURCE, name)];
  if (linkedTo(path, source)) return 'ok';
  if (stat(path) && !isLink(path) && !sameTree(path, source)) return 'conflict';
  if (CHECK_ONLY) return 'pending';
  if (stat(path)) isLink(path) ? removeLink(path) : rmSync(path, { recursive: true });
  makeLink(path, source);
  return 'linked';
}

function adopt(target, name) {
  const [path, source] = [join(target, name), join(SOURCE, name)];
  if (isLink(path) || existsSync(source) || CHECK_ONLY) return;
  cpSync(path, source, { recursive: true });
  console.log(`  adoptada  ${name}  (desde ${relative(ROOT, target)})`);
}

function main() {
  mkdirSync(SOURCE, { recursive: true });
  TARGETS.forEach((t) => dirs(t).forEach((n) => adopt(t, n)));
  const results = dirs(SOURCE).flatMap((n) => TARGETS.map((t) => [relative(ROOT, join(t, n)), ensure(t, n)]));
  const counts = {};
  results.forEach(([p, r]) => {
    counts[r] = (counts[r] ?? 0) + 1;
    if (r === 'conflict') console.error(`  CONFLICTO ${p}: difiere de agent/skills; resuélvelo a mano`);
    if (r === 'pending') console.log(`  pendiente ${p}`);
  });
  console.log(`skills: ${dirs(SOURCE).length} en agent/skills ·`, JSON.stringify(counts));
  process.exitCode = counts.conflict || (CHECK_ONLY && counts.pending) ? 1 : 0;
}

main();
