import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    setupFiles: ['./test/support/setup-env.ts'],
    globalSetup: ['./test/support/global-setup.ts'],
    fileParallelism: false, // todas comparten la misma base de pruebas
  },
});
