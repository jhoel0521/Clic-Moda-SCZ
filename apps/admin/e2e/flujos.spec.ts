import { expect, test, type Page } from '@playwright/test';
import { AUTH, unique } from './support/session';

test.use({ storageState: AUTH.gerente });

const open = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle'); // las islas de React ya están activas
};

async function registerProduct(page: Page, category: string, name: string) {
  await open(page, '/productos/nuevo');
  await page.getByLabel('Categoría').selectOption({ label: category });
  await page.getByLabel('Nombre del producto').fill(name);
  await page.getByLabel('Talla', { exact: true }).fill('38');
  await page.getByLabel('Color', { exact: true }).fill('Negro');
  await page.getByLabel('Precio (Bs)').fill('250');
  await page.getByRole('button', { name: 'Guardar producto' }).click();
  await page.waitForURL('**/productos');
}

async function openCell(page: Page, name: string, available: number) {
  await open(page, '/productos');
  await page.getByLabel('Buscar por modelo o SKU').fill(name);
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: `Talla 38 Negro: ${available} disponibles` }).click();
}

async function move(page: Page, action: 'Ingresar' | 'Retirar', label: string, units: string) {
  await page.getByRole('button', { name: action }).click();
  await page.getByLabel(label).fill(units);
  await page.getByRole('button', { name: 'Registrar' }).click();
}

test('el Gerente registra un producto y el stock entra por la cola hasta "Aplicado"', async ({ page }) => {
  const name = unique('Bota flujo');
  await open(page, '/categorias');
  await page.getByLabel('Nueva categoría').fill(`Cat ${name}`);
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.getByText(`Cat ${name}`)).toBeVisible();

  await registerProduct(page, `Cat ${name}`, name);
  await openCell(page, name, 0);
  await move(page, 'Ingresar', 'Unidades que ingresan', '5');

  await expect(page.getByText('Listo: el stock ya se actualizó.')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar' }).click();
  await expect(page.getByRole('button', { name: 'Talla 38 Negro: 5 disponibles' })).toBeVisible();
});

test('una salida mayor al stock se muestra rechazada y el stock no cambia', async ({ page }) => {
  const name = unique('Bota rechazo');
  await open(page, '/categorias');
  await page.getByLabel('Nueva categoría').fill(`Cat ${name}`);
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.getByText(`Cat ${name}`)).toBeVisible();
  await registerProduct(page, `Cat ${name}`, name);

  await openCell(page, name, 0);
  await move(page, 'Retirar', 'Unidades que salen', '9');

  await expect(page.getByText('No hay stock suficiente disponible')).toBeVisible();
});
