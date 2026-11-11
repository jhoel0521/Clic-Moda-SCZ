import { defineConfig, devices } from '@playwright/test';

// Pruebas de flujos contra la API REAL (base propia clic_moda_flows en el Postgres de Docker del proyecto).
// Puertos privados 10018 (API) y 10019 (panel) para no chocar con `pnpm dev`. Se ejecutan con: pnpm test:e2e
// Requisitos: pnpm docker:up y los navegadores de Playwright (pnpm exec playwright install chromium webkit).
const API = 'http://localhost:10018';
const ADMIN = 'http://localhost:10019';

export default defineConfig({
  testDir: './e2e',
  workers: 1, // comparten base de datos y usuarios: se ejecutan de uno en uno
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: ADMIN, trace: 'retain-on-failure' },
  webServer: [
    { command: 'node e2e/support/start-api.mjs', url: `${API}/health`, timeout: 240_000 },
    {
      command: 'pnpm build && node dist/server/entry.mjs',
      url: `${ADMIN}/login`,
      timeout: 240_000,
      env: { HOST: '127.0.0.1', PORT: '10019', API_URL: API, ADMIN_INSECURE_COOKIES: '1' },
    },
  ],
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testMatch: /flujos\.spec\.ts|permisos\.spec\.ts|acceso\.spec\.ts|imagenes\.spec\.ts/,
    },
    {
      name: 'iphone',
      use: { ...devices['iPhone 15'] },
      dependencies: ['setup'],
      testMatch: /flujos\.spec\.ts|permisos\.spec\.ts|acceso\.spec\.ts|imagenes\.spec\.ts/,
    },
    {
      name: 'movil-360',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 740 } },
      dependencies: ['setup'],
      testMatch: /layout\.spec\.ts/,
    },
  ],
});
