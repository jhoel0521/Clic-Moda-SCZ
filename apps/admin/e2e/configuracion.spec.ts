import { expect, test, type Page } from '@playwright/test';
import { AUTH, unique } from './support/session';

async function open(page: Page) {
  await page.goto('/configuracion');
  await page.waitForLoadState('networkidle'); // las islas de React ya están activas
}

test.describe('el Gerente: configuración de la tienda', () => {
  test.use({ storageState: AUTH.gerente });

  test('cambia el nombre, guarda y la API lo entrega a cualquier visitante', async ({ page, request }) => {
    const name = unique('Tienda').slice(0, 24);
    await open(page);

    await page.getByLabel('Nombre de la tienda').fill(name);
    await page.getByRole('button', { name: 'Guardar cambios' }).click();

    await expect(page.getByRole('status')).toContainText('menos de un minuto');
    const read = await request.get('http://localhost:10018/store-settings');
    expect((await read.json()).brandName).toBe(name);
    expect(read.headers()['cache-control']).toBe('public, max-age=15');
  });

  test('un color sin contraste se avisa y se corrige con el cercano que sí cumple', async ({ page }) => {
    await open(page);

    await page.getByLabel('Color principal').fill('#e63f6e');
    await expect(page.getByRole('alert').first()).toContainText('3.96:1');
    await page.getByRole('button', { name: 'Usar #e2245a' }).click();

    await expect(page.getByText(/Cumple el contraste AA/)).toBeVisible();
  });
});

test.describe('el Gerente: consola limpia', () => {
  test.use({ storageState: AUTH.gerente });

  test('abrir la pantalla no produce errores de hidratación ni de HTML inválido', async ({ page }) => {
    const problems: string[] = [];
    page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
    page.on('pageerror', (error) => problems.push(error.message));

    await open(page);

    expect(problems).toEqual([]);
  });
});

test.describe('el Gerente: vista previa y móvil', () => {
  test.use({ storageState: AUTH.gerente });

  test('la vista previa cambia entre móvil y escritorio', async ({ page }) => {
    await open(page);

    await expect(page.getByTestId('preview-frame')).toHaveCSS('width', '360px');
    await page.getByText('Escritorio 1280 px').click();

    await expect(page.getByTestId('preview-frame')).toHaveCSS('width', '1280px');
  });

  test('a 360 px la pantalla de configuración no se desborda', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await open(page);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    expect(overflow).toBeLessThanOrEqual(0);
  });
});

for (const role of ['despacho', 'atencion'] as const) {
  test.describe(`${role}: configuración`, () => {
    test.use({ storageState: AUTH[role] });

    test('no ve el enlace ni puede cambiar la configuración', async ({ page }) => {
      await open(page);

      await expect(page.getByText('Solo el Gerente puede cambiar la configuración de la tienda.')).toBeVisible();
      await expect(page.getByRole('link', { name: 'Configuración' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Guardar cambios' })).toHaveCount(0);
    });
  });
}
