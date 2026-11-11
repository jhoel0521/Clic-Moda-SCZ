// @ts-check
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// SSR con adaptador Node: la configuración de marca debe estar en el primer pintado.
export default defineConfig({
  output: 'server',
  // El orquestador fija PORT desde ports.json; el valor por defecto coincide con él.
  server: { port: Number(process.env.PORT) || 10012 },
  adapter: node({ mode: 'standalone' }),
  vite: { plugins: [tailwindcss()] },
});
