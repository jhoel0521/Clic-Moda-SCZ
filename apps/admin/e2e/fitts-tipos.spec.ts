import { expect, test, type Page } from '@playwright/test';
import { asRole, AUTH, createProduct, unique } from './support/session';

test.use({ storageState: AUTH.gerente });

interface Measure {
  count: number;
  small: string[]; // controles de menos de 44 px
  minGap: number; // separación mínima entre controles vecinos
}

type Box = { el: HTMLElement; rect: DOMRect };

// Mide los controles visibles dentro de `scope`: tamaño táctil (Fitts) y separación entre vecinos. Las
// funciones auxiliares van dentro para viajar al navegador junto con esta.
function measureInPage({ selector, rowSelector }: { selector: string; rowSelector: string }): Measure {
  const gap = (a: DOMRect, b: DOMRect): number => {
    const oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    const ox = Math.min(a.right, b.right) - Math.max(a.left, b.left);
    if (oy > 4) return Math.max(a.left, b.left) - Math.min(a.right, b.right);
    return ox > 4 ? Math.max(a.top, b.top) - Math.min(a.bottom, b.bottom) : Infinity;
  };
  const query = 'a[href], button, select, input:not([type=hidden]), [role=switch]';
  const boxes: Box[] = [...(document.querySelector(selector) ?? document.body).querySelectorAll<HTMLElement>(query)]
    .map((el) => ({ el, rect: el.getBoundingClientRect() }))
    .filter(({ rect }) => rect.width > 0 && rect.height > 0);
  const small = boxes
    .filter(({ rect }) => rect.width < 44 || rect.height < 44)
    .map(({ el }) => el.textContent?.trim() || el.tagName);
  const gaps = boxes.flatMap((a, i) => boxes.slice(i + 1).map((b) => gap(a.rect, b.rect)));
  const count = boxes.filter(({ el }) => !rowSelector || !el.matches(rowSelector)).length;
  return { count, small, minGap: Math.round(Math.min(...gaps, 999)) };
}

const measure = (page: Page, scope: string, rows = ''): Promise<Measure> =>
  page.evaluate(measureInPage, { selector: scope, rowSelector: rows });

// Las filas de la lista (un control cada una) no cuentan como opciones: crecen con los datos. Lo que cuenta
// son las pestañas, el alta y, si se abre un tipo, su editor.
const ROWS = '[data-type-code]';

test('la pantalla de tipos a 390 px: como máximo 7 controles fuera de la lista, todos de 44 px y a 8 px', async ({
  page,
}) => {
  await page.goto('/productos/tipos');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /^Retiros/ }).click();

  const result = await measure(page, 'main', ROWS);

  expect(result.count).toBeGreaterThanOrEqual(5); // 3 pestañas + nombre y Agregar
  expect(result.count).toBeLessThanOrEqual(7);
  expect(result.small).toEqual([]);
  expect(result.minGap).toBeGreaterThanOrEqual(8);
});

test('abrir un tipo muestra su editor con controles de 44 px y a 8 px', async ({ page }) => {
  await page.goto('/productos/tipos');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /^Retiros/ }).click();
  await page.getByRole('button', { name: /^Venta/ }).click();

  const result = await measure(page, 'main', ROWS);

  expect(result.count).toBeGreaterThanOrEqual(7); // 3 pestañas + nombre, Guardar, Cancelar e interruptor (el alta se oculta)
  expect(result.small).toEqual([]);
  expect(result.minGap).toBeGreaterThanOrEqual(8);
});

test('la hoja de movimiento a 390 px: 4 controles de 44 px o más y 8 px entre vecinos', async ({ page }) => {
  const name = unique('Bota medida');
  await createProduct(await asRole('gerente'), name);
  await page.goto('/productos');
  await page.waitForLoadState('networkidle');
  await page.getByLabel('Buscar por modelo o SKU').fill(name);
  await page.getByRole('button', { name: new RegExp(name) }).click();
  await page.getByRole('button', { name: 'Talla 38 Negro: 0 disponibles' }).click();
  await page.getByRole('button', { name: 'Retirar' }).click();
  await expect(page.getByLabel('Tipo', { exact: true })).toBeVisible();

  const result = await measure(page, 'dialog[open]');

  expect(result.count).toBeGreaterThanOrEqual(4); // midió controles de verdad
  expect(result.small).toEqual([]);
  expect(result.minGap).toBeGreaterThanOrEqual(8);
  expect(result.count).toBeLessThanOrEqual(7); // unidades, tipo, motivo y registrar (más lo que ofrezca el panel)
});
