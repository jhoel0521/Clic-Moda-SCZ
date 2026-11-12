import { expect, test } from '@playwright/test';
import { AUTH } from './support/session';

test.use({ storageState: AUTH.gerente });

// 360 px: la página nunca se desplaza en horizontal (la matriz sí lo hace, pero dentro de su propio contenedor).
for (const path of ['/', '/categorias', '/productos', '/productos/nuevo', '/productos/tipos']) {
  test(`${path} no se desborda a 360 px`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    expect(overflow).toBeLessThanOrEqual(0);
  });
}
