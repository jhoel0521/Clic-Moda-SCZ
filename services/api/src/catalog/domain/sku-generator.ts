import { Color, Size, Sku } from './value-objects/variant-attributes.vo.js';
import { ProductName } from './value-objects/names.vo.js';

const strip = (text: string): string => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();

const letters = (text: string, count: number): string =>
  strip(text)
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, count);

const sizeToken = (size: Size): string =>
  strip(size.value)
    .replace(/[^A-Z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

// Servicio de dominio puro: compone un SKU legible (producto-talla-color) y, si el caso de uso
// descubre que ya existe, pide el siguiente intento, que añade un sufijo numérico.
export const SkuGenerator = {
  generate(name: ProductName, size: Size, color: Color | null, attempt = 0): Sku {
    const parts = [letters(name.value, 3).padEnd(3, 'X'), sizeToken(size)];
    if (color) parts.push(letters(color.value, 3));
    if (attempt > 0) parts.push(String(attempt + 1));
    return Sku.of(parts.filter(Boolean).join('-'));
  },
};
