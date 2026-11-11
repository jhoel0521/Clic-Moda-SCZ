import { expect, test, type Page } from '@playwright/test';
import { solidPng } from './support/png';
import { asRole, AUTH, createProduct, unique } from './support/session';

async function productId(name: string): Promise<string> {
  const api = await asRole('gerente');
  const res = await api.get(`/api/catalog/products?text=${encodeURIComponent(name)}`);
  return (await res.json()).items[0].id;
}

async function addPhoto(page: Page, alt: string, color: [number, number, number]) {
  // El <details> se abre una sola vez: un segundo clic lo cerraría.
  await page.locator('details').evaluate((el) => ((el as HTMLDetailsElement).open = true));
  await page.getByLabel('Foto', { exact: true }).setInputFiles({
    name: 'f.png',
    mimeType: 'image/png',
    buffer: solidPng(1400, 1000, color),
  });
  await page.getByLabel('Texto alternativo', { exact: true }).fill(alt);
  await page.getByRole('button', { name: 'Subir imagen' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: alt })).toBeVisible();
}

function watchConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on('console', (message) => message.type() === 'error' && problems.push(message.text()));
  page.on('pageerror', (error) => problems.push(error.message));
  return problems;
}

// El SKU se genera con las primeras letras del nombre y la base de flujos se conserva entre corridas: un
// prefijo aleatorio evita agotar los SKU de un nombre repetido.
const randomLetters = (): string =>
  Array.from({ length: 3 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');

async function openEdit(page: Page, suffix: string) {
  const name = unique(`${randomLetters()} ${suffix}`);
  await createProduct(await asRole('gerente'), name);
  await page.goto(`/productos/${await productId(name)}`);
  await page.waitForLoadState('networkidle');
}

test.describe('el Gerente: fotos del producto', () => {
  test.use({ storageState: AUTH.gerente });

  test('sube dos fotos, las reordena, guarda y el orden se conserva al recargar, con la consola limpia', async ({
    page,
  }) => {
    const problems = watchConsole(page);
    await openEdit(page, 'fotos');
    const [first, second] = [unique('Frente'), unique('Lado')];

    await addPhoto(page, first, [199, 48, 90]);
    await addPhoto(page, second, [48, 90, 199]);
    await page.getByRole('button', { name: `Subir la foto ${second}` }).click();
    await page.getByRole('button', { name: 'Guardar fotos' }).click();
    await expect(page.getByRole('status')).toContainText('Fotos guardadas');

    await page.reload();
    await page.waitForLoadState('networkidle');
    const rows = page.getByRole('list', { name: 'Fotos del producto' }).getByRole('listitem');
    await expect(rows.first()).toContainText(second);
    await expect(rows.first()).toContainText('Principal');
    expect(problems).toEqual([]);
  });
});

test.describe('el Gerente: fotos a 360 px', () => {
  test.use({ storageState: AUTH.gerente });

  test('la sección de fotos no se desborda', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await openEdit(page, 'movil');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    expect(overflow).toBeLessThanOrEqual(0);
  });
});
