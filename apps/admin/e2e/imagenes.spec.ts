import { expect, test, type Page } from '@playwright/test';
import { solidPng } from './support/png';
import { AUTH, unique } from './support/session';

const photo = () => solidPng(1400, 1000, [199, 48, 90]);

async function open(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle'); // las islas de React ya están activas
}

async function upload(page: Page, alt: string) {
  await open(page, '/imagenes');
  await page
    .getByLabel('Foto', { exact: true })
    .setInputFiles({ name: 'zapato.png', mimeType: 'image/png', buffer: photo() });
  await page.getByLabel('Texto alternativo', { exact: true }).fill(alt);
  await page.getByRole('button', { name: 'Subir imagen' }).click();
  await expect(page.getByText('Revisión 1')).toBeVisible();
}

test.describe('el Gerente', () => {
  test.use({ storageState: AUTH.gerente });

  test('sube una foto, mueve el enfoque con el teclado y guarda una revisión nueva', async ({ page }) => {
    await upload(page, unique('Bota flujo'));

    await page.getByRole('radio', { name: /Historia 9:16/ }).check({ force: true });
    await expect(page.getByText('Arriba 14 %')).toBeVisible();
    await page.getByRole('button', { name: /Punto de enfoque/ }).press('ArrowRight');
    await page.getByRole('button', { name: 'Guardar encuadre' }).click();

    await expect(page.getByText('Revisión 2')).toBeVisible();
  });
});

test.describe('el Gerente: descargas y vistas previas', () => {
  test.use({ storageState: AUTH.gerente });

  test('cada formato se descarga como imagen pública con caché inmutable', async ({ page }) => {
    await upload(page, unique('Bota descarga'));

    const href = await page.getByRole('link', { name: 'Descargar Historia 9:16' }).getAttribute('href');
    const response = await page.request.get(href as string);

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toBe('image/jpeg');
    expect(response.headers()['cache-control']).toContain('immutable');
  });

  test('las tres vistas previas de enlace están visibles', async ({ page }) => {
    await upload(page, unique('Bota tarjetas'));

    for (const channel of ['WhatsApp', 'Facebook', 'X']) {
      await expect(page.getByRole('region', { name: `Vista previa en ${channel}` })).toBeVisible();
    }
  });

  test('a 360 px la pantalla de imágenes no se desborda', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await upload(page, unique('Bota móvil'));

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    expect(overflow).toBeLessThanOrEqual(0);
  });
});

for (const role of ['despacho', 'atencion'] as const) {
  test.describe(`${role}`, () => {
    test.use({ storageState: AUTH[role] });

    test('no ve el enlace de Imágenes ni puede administrarlas', async ({ page }) => {
      await open(page, '/imagenes');

      await expect(page.getByText('Solo el Gerente puede administrar las imágenes.')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Imágenes' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Subir imagen' })).toHaveCount(0);
    });
  });
}
