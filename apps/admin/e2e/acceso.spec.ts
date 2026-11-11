import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('sin sesión, entrar a una pantalla lleva al login con el destino', async ({ page }) => {
  await page.goto('/productos');

  await expect(page).toHaveURL(/\/login\?next=%2Fproductos/);
});

test('un correo o contraseña incorrectos muestran el error y no entran', async ({ page }) => {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.getByLabel('Correo').fill('nadie@flows.local');
  await page.getByLabel('Contraseña').fill('clave-incorrecta-123');
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test('las rutas /api sin sesión responden 401', async ({ request }) => {
  const response = await request.get('/api/catalog/products');

  expect(response.status()).toBe(401);
});
