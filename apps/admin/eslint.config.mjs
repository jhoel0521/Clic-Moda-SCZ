import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/**', '.astro/**', 'node_modules/**', 'test-results/**', 'playwright-report/**']),
  {
    // Los archivos de configuración se ejecutan en Node: pueden leer process.env.
    files: ['*.config.{js,mjs,ts}', 'e2e/**/*.{mjs,ts}'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    // Funciones cortas: máximo 25 líneas de código (sin blancos ni comentarios).
    rules: {
      'max-lines-per-function': ['error', { max: 25, skipBlankLines: true, skipComments: true }],
    },
  },
]);
