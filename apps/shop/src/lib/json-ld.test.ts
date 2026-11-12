import { describe, expect, it } from 'vitest';
import type { Product } from './catalog';
import { productJsonLd, safeJsonLd } from './json-ld';

const product = (over: Partial<Product> = {}): Product => ({
  slug: 'bota-andes',
  name: 'Bota Andes',
  category: { name: 'Botas', slug: 'botas' },
  price: '349.90',
  priceVaries: true,
  availability: 'in_stock',
  updatedAt: '2026-11-02T00:00:00.000Z',
  description: 'Cuero',
  photos: [
    {
      alt: 'Frente',
      card: '/m/a/card-1.webp',
      thumb: '/m/a/thumb-1.webp',
      link: '/m/a/link-1.jpg',
    },
  ],
  variants: [
    { size: '38', color: 'Negro', sku: 'BOT-38-NEG', price: '349.90', availability: 'low' },
    { size: '39', color: 'Negro', sku: 'BOT-39-NEG', price: '380.00', availability: 'out' },
  ],
  ...over,
});

describe('safeJsonLd', () => {
  it('un nombre con </script> no puede cerrar el bloque y el JSON sigue siendo válido', () => {
    const text = safeJsonLd({ name: '</script><script>alert(1)</script>' });

    expect(text).not.toContain('<');
    expect(text).not.toContain('>');
    expect(JSON.parse(text).name).toBe('</script><script>alert(1)</script>');
  });

  it('escapa & y los separadores de línea Unicode', () => {
    const text = safeJsonLd({ a: 'x&y\u2028z' });

    expect(text).not.toMatch(/[&\u2028]/);
    expect(JSON.parse(text).a).toBe('x&y\u2028z');
  });
});

interface Ld {
  '@type': string;
  image: string[];
  sku: string;
  offers: { availability: string; price: string; priceCurrency: string; url: string }[];
}

const ld = (item: Product): Ld => productJsonLd(item, 'https://tienda.test') as unknown as Ld;

describe('productJsonLd', () => {
  it('trae nombre, imágenes absolutas, SKU, precio en BOB y disponibilidad por variante', () => {
    const data = ld(product());

    expect(data['@type']).toBe('Product');
    expect(data.image).toEqual(['https://tienda.test/m/a/link-1.jpg']);
    expect(data.sku).toBe('BOT-38-NEG');
    expect(data.offers.map((o) => o.availability)).toEqual([
      'https://schema.org/LimitedAvailability',
      'https://schema.org/OutOfStock',
    ]);
    expect(data.offers[0]).toMatchObject({
      price: '349.90',
      priceCurrency: 'BOB',
      url: 'https://tienda.test/p/bota-andes',
    });
  });

  it('cada oferta lleva el precio de su variante', () => {
    expect(ld(product()).offers.map((o) => o.price)).toEqual(['349.90', '380.00']);
  });

  it('sin descripción omite el campo', () => {
    const data = productJsonLd(product({ description: null }), 'https://tienda.test');

    expect(JSON.parse(safeJsonLd(data))).not.toHaveProperty('description');
  });
});
