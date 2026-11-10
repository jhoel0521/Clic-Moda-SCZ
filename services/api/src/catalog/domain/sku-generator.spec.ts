import { SkuGenerator } from './sku-generator.js';
import { ProductName } from './value-objects/names.vo.js';
import { Color, Size } from './value-objects/variant-attributes.vo.js';

const generate = (name: string, size: string, color: string | null, attempt = 0): string =>
  SkuGenerator.generate(
    ProductName.of(name),
    Size.of(size),
    color ? Color.of(color) : null,
    attempt
  ).value;

describe('SkuGenerator', () => {
  it('compone producto-talla-color legible', () => {
    expect(generate('Zapatilla Runner', '38', 'Negro')).toBe('ZAP-38-NEG');
  });

  it('quita tildes y respeta tallas con punto o barra', () => {
    expect(generate('Botín Ñandú', '38.5', 'Café')).toBe('BOT-38.5-CAF');
    expect(generate('Sandalia', '36/37', null)).toBe('SAN-36-37');
  });

  it('completa nombres muy cortos para llegar al mínimo de 3 caracteres', () => {
    expect(generate('Ab', '38', null)).toBe('ABX-38');
  });

  it('un intento mayor que cero añade un sufijo para evitar choques', () => {
    expect(generate('Zapatilla Runner', '38', 'Negro', 1)).toBe('ZAP-38-NEG-2');
    expect(generate('Zapatilla Runner', '38', 'Negro', 2)).toBe('ZAP-38-NEG-3');
  });

  it('es determinista: mismos datos, mismo SKU', () => {
    expect(generate('Runner', 'M', 'Rojo')).toBe(generate('Runner', 'M', 'Rojo'));
  });

  it('nunca supera el máximo de 40 caracteres', () => {
    expect(generate('Zapatilla', '36 / 37 / 38 / 39', 'Azul marino', 9).length).toBeLessThanOrEqual(
      40
    );
  });
});
