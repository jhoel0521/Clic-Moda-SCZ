// @ts-check
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// SSR con adaptador Node + islas React para las pantallas interactivas del panel.
export default defineConfig({
  output: 'server',
  // El orquestador fija PORT desde ports.json; el valor por defecto coincide con él.
  server: { port: Number(process.env.PORT) || 10011 },
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
