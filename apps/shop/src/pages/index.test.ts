import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Index from './index.astro';

test('la página de inicio se renderiza con su título y sus estilos', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Index);

  expect(html).toContain('<h1');
  expect(html).toContain('Tienda');
  expect(html).toContain('lang="es"');
});
