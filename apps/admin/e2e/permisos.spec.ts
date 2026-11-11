import { expect, test, type Page } from '@playwright/test';
import { asRole, AUTH, createProduct, unique } from './support/session';

async function openModel(page: Page, name: string) {
  await page.goto('/productos');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Buscar por modelo o SKU').fill(name);
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: /^Talla 38 Negro/ }).click();
}

test('Atención solo consulta: no ve botones de modificar', async ({ browser }) => {
  const name = unique('Bota atención');
  await createProduct(await asRole('gerente'), name);
  const context = await browser.newContext({ storageState: AUTH.atencion });
  const page = await context.newPage();

  await openModel(page, name);

  await expect(page.getByRole('button', { name: 'Ingresar' })).toHaveCount(0);
  await expect(page.getByLabel('Precio del modelo (Bs)')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Registrar modelo/ })).toHaveCount(0);
  await context.close();
});

test('Despacho mueve el stock pero no cambia precios ni registra modelos', async ({ browser }) => {
  const name = unique('Bota despacho');
  await createProduct(await asRole('gerente'), name);
  const context = await browser.newContext({ storageState: AUTH.despacho });
  const page = await context.newPage();

  await openModel(page, name);

  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  await expect(page.getByLabel('Precio del modelo (Bs)')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Registrar modelo/ })).toHaveCount(0);
  await context.close();
});
