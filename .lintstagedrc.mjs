// Se ejecuta en cada commit (hook pre-commit de husky) sobre los archivos en staging.
// El orquestador solo conoce el escáner de secretos; lint, pruebas y build los resuelve cada
// subproyecto con sus propios scripts (ver scripts/verify-projects.mjs).
const quote = (files) => files.map((f) => JSON.stringify(f)).join(" ");

export default {
  "*": (files) => `secretlint ${quote(files)}`,
};
