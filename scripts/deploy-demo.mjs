// Compila la demo estática y la publica en la rama gh-pages (GitHub Pages).
// Uso: npm run deploy:demo
import { execSync } from 'node:child_process';
import { cpSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';

const REPO_BASE_PATH = '/Clic-Moda-SCZ';
const run = (command, cwd) => execSync(command, { cwd, stdio: 'inherit' });
const origin = execSync('git remote get-url origin').toString().trim();

run('npx next build', undefined);

/**
 * Next exporta los datos de navegación en subcarpetas (__next.X/catalogo/__PAGE__.txt)
 * pero el navegador los pide con nombre plano (__next.X.catalogo.__PAGE__.txt).
 * Sin esta copia cada toque da 404 y se pierde la navegación instantánea.
 */
function flattenSegmentFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const path = join(dir, entry.name);
    if (entry.name.startsWith('__next.')) {
      for (const file of readdirSync(path, { recursive: true, withFileTypes: true })) {
        if (!file.isFile()) continue;
        const full = join(file.parentPath, file.name);
        const flat = relative(path, full).split(sep).join('.');
        cpSync(full, join(dir, `${entry.name}.${flat}`));
      }
    } else if (entry.name !== '_next') {
      flattenSegmentFiles(path);
    }
  }
}

const site = mkdtempSync(join(tmpdir(), 'clic-moda-pages-'));
try {
  cpSync('out', site, { recursive: true });
  flattenSegmentFiles(site);
  // Sin este archivo GitHub Pages ignora la carpeta _next.
  writeFileSync(join(site, '.nojekyll'), '');
  run('git init -q -b gh-pages', site);
  run('git config core.autocrlf false', site);
  run('git add -A', site);
  run(
    'git -c user.name=deploy -c user.email=deploy@users.noreply.github.com commit -q -m "Publicar demo"',
    site
  );
  run(`git push -f "${origin}" gh-pages`, site);
  console.log(`Publicado ${readdirSync(site).length} elementos en gh-pages (${REPO_BASE_PATH}).`);
} finally {
  rmSync(site, { recursive: true, force: true });
}
