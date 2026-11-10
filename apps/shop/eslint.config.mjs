import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Funciones cortas: máximo 25 líneas de código (sin blancos ni comentarios).
    // "warn" porque el código heredado del MVP tiene ~75 funciones por encima;
    // en proyectos nuevos (api/admin) esta regla va como "error".
    rules: {
      'max-lines-per-function': ['warn', { max: 25, skipBlankLines: true, skipComments: true }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
]);

export default eslintConfig;
