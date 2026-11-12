import { describe, expect, it } from 'vitest';
import type { VariantOption } from './catalog';
import {
  inquiryLink,
  inquiryMessage,
  productPath,
  productUrl,
  restockMessage,
  selectVariant,
} from './inquiry';

const ORIGIN = 'https://tienda.test';
const product = { name: 'Bota Andes', slug: 'bota-andes' };
const v = (size: string, color: string | null, sku = `S-${size}`): VariantOption => ({
  size,
  color,
  sku,
  price: '349.90',
  availability: 'in_stock',
});

describe('URL canónica', () => {
  it('es siempre /p/<slug>, sin talla, color ni ref', () => {
    expect(productPath('bota-andes')).toBe('/p/bota-andes');
    expect(productUrl(ORIGIN, 'bota-andes')).toBe('https://tienda.test/p/bota-andes');
    expect(productUrl(`${ORIGIN}/`, 'bota-andes')).toBe('https://tienda.test/p/bota-andes');
  });
});

describe('selectVariant', () => {
  const variants = [v('38', 'Negro'), v('38', 'Café'), v('39', 'Negro')];

  it('talla y color eligen una variante', () => {
    expect(selectVariant(variants, '38', 'Café')?.color).toBe('Café');
  });

  it('sin talla no hay variante', () => {
    expect(selectVariant(variants, null, 'Negro')).toBeNull();
  });

  it('con una sola variante de esa talla el color no hace falta; con varias, sí', () => {
    expect(selectVariant(variants, '39', null)?.size).toBe('39');
    expect(selectVariant(variants, '38', null)).toBeNull();
  });

  it('una combinación que no existe da null', () => {
    expect(selectVariant(variants, '39', 'Café')).toBeNull();
  });
});

describe('selectVariant: colores agotados', () => {
  const sold = { ...v('44', 'Coñac'), availability: 'out' as const };
  const variants = [sold, v('44', 'Verde musgo')];

  it('sin color elige la única variante que se puede comprar de esa talla', () => {
    expect(selectVariant(variants, '44', null)?.color).toBe('Verde musgo');
  });

  it('con todo agotado de esa talla y varios colores sigue sin elegir', () => {
    const allOut = variants.map((variant) => ({ ...variant, availability: 'out' as const }));

    expect(selectVariant(allOut, '44', null)).toBeNull();
  });
});

describe('mensaje de consulta', () => {
  it('incluye producto, talla, color, código, enlace y referencia', () => {
    const message = inquiryMessage({
      product,
      origin: ORIGIN,
      variant: v('38', 'Negro', 'BOT-38-NEG'),
      ref: 'live-nov',
    });

    expect(message).toBe(
      'Hola, me interesa: Bota Andes\nTalla: 38\nColor: Negro\nCódigo: BOT-38-NEG\nPrecio: Bs 349,90\nhttps://tienda.test/p/bota-andes\nRef: live-nov'
    );
  });
});

describe('mensaje de consulta: opcionales y enlace', () => {
  it('sin color ni referencia no los menciona', () => {
    const message = inquiryMessage({
      product,
      origin: ORIGIN,
      variant: v('38', null, 'BOT-38'),
      ref: null,
    });

    expect(message).not.toMatch(/Color|Ref/);
  });

  it('el enlace de WhatsApp codifica el mensaje con saltos de línea', () => {
    const link = inquiryLink('59171234567', 'Hola\nTalla: 38');

    expect(link).toBe('https://wa.me/59171234567?text=Hola%0ATalla%3A%2038');
  });
});

describe('producto agotado', () => {
  it('pregunta cuándo vuelve, sin talla, y lleva la referencia', () => {
    const message = restockMessage({ product, origin: ORIGIN, ref: 'live-nov' });

    expect(message).toBe(
      'Hola, ¿cuándo vuelve a estar disponible: Bota Andes?\nhttps://tienda.test/p/bota-andes\nRef: live-nov'
    );
  });
});
