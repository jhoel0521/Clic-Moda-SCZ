import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist/**', '.astro/**', 'node_modules/**']),
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
