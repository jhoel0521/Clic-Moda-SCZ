import { expect, test, type Page } from '@playwright/test';
import { asRole, AUTH, createProduct, unique } from './support/session';

const open = async (page: Page, path: string) => {
  await page.goto(path);
  await page.waitForLoadState('networkidle'); // las islas de React ya están activas
};

async function openCell(page: Page, name: string, available: number) {
  await open(page, '/productos');
  await page.getByLabel('Buscar por modelo o SKU').fill(name);
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: `Talla 38 Negro: ${available} disponibles` }).click();
}

async function registerMovement(page: Page, action: 'Ingresar' | 'Retirar', units: string, typeName?: string) {
  await page.getByRole('button', { name: action }).click();
  const label = action === 'Ingresar' ? 'Unidades que ingresan' : 'Unidades que salen';
  await page.getByLabel(label).fill(units);
  if (typeName) await page.getByLabel('Tipo', { exact: true }).selectOption({ label: typeName });
  await page.getByRole('button', { name: 'Registrar' }).click();
  await expect(page.getByText('Listo: el stock ya se actualizó.')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar' }).click();
}

async function createWithdrawalType(page: Page, typeName: string) {
  await open(page, '/productos');
  await page.getByRole('link', { name: 'Tipos de movimiento' }).click();
  await page.waitForURL('**/productos/tipos');
  await page.getByRole('button', { name: /^Retiros/ }).click();
  await page.getByLabel('Nuevo tipo de retiro').fill(typeName);
  await page.getByRole('button', { name: 'Agregar' }).click();
  await expect(page.getByText(`Tipo «${typeName}» creado`)).toBeVisible();
}

// Ingresa 5 unidades con el tipo por omisión y retira 2 con el tipo elegido: el saldo queda en 3.
async function moveStock(page: Page, name: string, typeName: string) {
  await openCell(page, name, 0);
  await registerMovement(page, 'Ingresar', '5');
  await registerMovement(page, 'Retirar', '2', typeName);
}

// El estado de la cola (solo por la API) informa también las entregas de eventos. Hoy no hay suscriptores
// en producción, así que no hay entregas pendientes ni en revisión.
async function expectEventsInQueueStatus() {
  const queue = await (await (await asRole('gerente')).get('/api/inventory/queue')).json();
  expect(queue.events).toEqual({ pending: 0, needsReview: 0, oldestPendingAgeSeconds: null });
}

test.describe('Gerente', () => {
  test.use({ storageState: AUTH.gerente });

  test('crea un tipo, lo usa en un retiro, ve el tipo y el saldo en el historial', async ({ page }) => {
    const name = unique('Bota tipo');
    const typeName = unique('Merma');
    await createProduct(await asRole('gerente'), name);
    await createWithdrawalType(page, typeName);

    await moveStock(page, name, typeName);
    await page.getByRole('button', { name: 'Ver historial' }).click();

    await expect(page.getByText(typeName, { exact: true })).toBeVisible();
    await expect(page.getByText('Saldo 3')).toBeVisible();
    await expectEventsInQueueStatus();
  });
});

test.describe('Gerente: baja de un tipo', () => {
  test.use({ storageState: AUTH.gerente });

  test('un tipo desactivado deja de ofrecerse al registrar un retiro', async ({ page }) => {
    const name = unique('Bota baja');
    const typeName = unique('Cambio');
    await createProduct(await asRole('gerente'), name);
    await createWithdrawalType(page, typeName);

    await page.getByRole('button', { name: new RegExp(`^${typeName}`) }).click();
    await page.getByRole('switch', { name: 'Tipo activo' }).click();
    await expect(page.getByText(`Tipo «${typeName}» desactivado`)).toBeVisible();

    await openCell(page, name, 0);
    await page.getByRole('button', { name: 'Retirar' }).click();
    await expect(page.getByLabel('Tipo', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Tipo', { exact: true }).locator('option', { hasText: typeName })).toHaveCount(0);
  });
});

test.describe('Despacho', () => {
  test.use({ storageState: AUTH.despacho });

  test('ve los tipos de movimiento en solo lectura', async ({ page }) => {
    await open(page, '/productos/tipos');

    await expect(page.getByText('Ingreso por compra')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Agregar' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /Ingreso por compra/ })).toHaveCount(0);
  });
});
