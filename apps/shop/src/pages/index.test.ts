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

test('el HTML del servidor trae las etiquetas de compartir y el título con la tienda', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(Index);

  expect(html).toContain('<title>Tienda · Clic Moda SC</title>');
  expect(html).toContain('property="og:title" content="Tienda"');
  expect(html).toContain('property="og:site_name" content="Clic Moda SC"');
  expect(html).toContain('name="twitter:card"');
  expect(html).toContain('rel="canonical"');
});
