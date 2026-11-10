// Se ejecuta en cada commit (hook pre-commit de husky) sobre los archivos en staging.
import { existsSync, readdirSync } from "node:fs";

const quote = (files) => files.map((f) => JSON.stringify(f)).join(" ");

// Todos los subproyectos del monorepo. Cada uno usa su propia instalación y config.
const PROJECTS = ["apps/shop", "apps/admin", "services/api"];

const hasEslint = (dir) =>
  existsSync(dir) && readdirSync(dir).some((f) => f.startsWith("eslint.config."));

const config = {
  // 1) Protector de secretos: cualquier archivo en staging, de cualquier proyecto.
  "*": (files) => `secretlint ${quote(files)}`,
};

// 2) Formato + lint por subproyecto (se activa solo cuando el proyecto tiene ESLint).
for (const dir of PROJECTS.filter(hasEslint)) {
  const run = (tool, args, files) =>
    `pnpm --dir ${dir} exec ${tool} ${args} ${quote(files)}`;
  config[`${dir}/**/*.{ts,tsx,js,jsx,mjs}`] = (files) => [
    run("prettier", "--write", files),
    run("eslint", "--fix", files),
  ];
  config[`${dir}/**/*.{json,css}`] = (files) => [
    run("prettier", "--write", files),
  ];
}

export default config;
