import {
  InvalidCategoryNameError,
  InvalidCatalogIdError,
  InvalidColorError,
  InvalidMoneyError,
  InvalidProductNameError,
  InvalidSizeError,
  InvalidSkuError,
  InvalidSlugError,
} from '../errors/invalid-value.errors.js';
import { CategoryId, ProductId, VariantId } from './ids.vo.js';
import { Money } from './money.vo.js';
import { CategoryName, ProductName, Slug } from './names.vo.js';
import { Color, Size, Sku } from './variant-attributes.vo.js';

describe('CategoryName y ProductName', () => {
  it('quitan espacios sobrantes y colapsan los internos', () => {
    expect(CategoryName.of('  Zapatillas   Urbanas ').value).toBe('Zapatillas Urbanas');
    expect(ProductName.of(' Runner  Pro ').value).toBe('Runner Pro');
  });

  it.each(['', ' ', 'A', 'x'.repeat(61)])('CategoryName rechaza "%s"', (raw) => {
    expect(() => CategoryName.of(raw)).toThrow(InvalidCategoryNameError);
  });

  it('CategoryName acepta los límites 2 y 60', () => {
    expect(CategoryName.of('ab').value).toBe('ab');
    expect(CategoryName.of('x'.repeat(60)).value).toHaveLength(60);
  });

  it.each(['A', 'x'.repeat(121)])('ProductName rechaza "%s"', (raw) => {
    expect(() => ProductName.of(raw)).toThrow(InvalidProductNameError);
  });
});

describe('Slug', () => {
  it('quita tildes y símbolos y une con guiones', () => {
    expect(Slug.fromText('Zapatillas Urbanas').value).toBe('zapatillas-urbanas');
    expect(Slug.fromText('  ¡Niños & Niñas! ').value).toBe('ninos-ninas');
    expect(Slug.fromText('Botín  Ñandú').value).toBe('botin-nandu');
  });

  it('no deja guiones al final tras recortar al largo máximo', () => {
    const slug = Slug.fromText(`${'a'.repeat(79)} b`).value;
    expect(slug.endsWith('-')).toBe(false);
    expect(slug.length).toBeLessThanOrEqual(80);
  });

  it.each(['', '***', '---'])('rechaza un texto sin letras ni números: "%s"', (raw) => {
    expect(() => Slug.fromText(raw)).toThrow(InvalidSlugError);
  });

  it('of rechaza un formato inválido', () => {
    expect(() => Slug.of('Con Espacios')).toThrow(InvalidSlugError);
  });
});

describe('Money', () => {
  it('guarda 349.90 sin pérdida de precisión', () => {
    const price = Money.ofDecimal('349.90');
    expect(price.cents).toBe(34990);
    expect(price.toDecimal()).toBe('349.90');
  });

  it.each([
    ['349.9', 34990],
    ['349', 34900],
    ['0.05', 5],
    [12.5, 1250],
    ['100000', 10_000_000],
  ])('interpreta %s como %i centavos', (raw, cents) => {
    expect(Money.ofDecimal(raw).cents).toBe(cents);
  });

  it.each(['0', '0.00', '-5', '1.234', '100000.01', '10e2', 'abc', '', '1,50', ' '])(
    'rechaza el precio "%s"',
    (raw) => {
      expect(() => Money.ofDecimal(raw)).toThrow(InvalidMoneyError);
    }
  );
});

describe('Money: límites', () => {
  it('ofCents exige un entero positivo dentro del máximo', () => {
    expect(() => Money.ofCents(1.5)).toThrow(InvalidMoneyError);
    expect(() => Money.ofCents(0)).toThrow(InvalidMoneyError);
    expect(() => Money.ofCents(10_000_001)).toThrow(InvalidMoneyError);
    expect(Money.ofCents(1).toDecimal()).toBe('0.01');
  });

  it('dos importes iguales son iguales por valor', () => {
    expect(Money.ofDecimal('1.5').equals(Money.ofCents(150))).toBe(true);
  });
});

describe('Sku', () => {
  it('se normaliza a mayúsculas, así que "zap-38" y "ZAP-38" son el mismo', () => {
    expect(Sku.of(' zap-38.a ').value).toBe('ZAP-38.A');
    expect(Sku.of('zap-38').equals(Sku.of('ZAP-38'))).toBe(true);
  });

  it.each(['', 'ab', 'x'.repeat(41), 'con espacio', 'ñandú-1', 'a_b_c'])('rechaza "%s"', (raw) => {
    expect(() => Sku.of(raw)).toThrow(InvalidSkuError);
  });
});

describe('Size y Color', () => {
  it.each(['38', '38.5', 'M', 'Única', '36/37', 'XL'])('Size acepta "%s"', (raw) => {
    expect(Size.of(raw).value).toBe(raw);
  });

  it.each(['', ' ', 'x'.repeat(21), 'a;b', '<b>'])('Size rechaza "%s"', (raw) => {
    expect(() => Size.of(raw)).toThrow(InvalidSizeError);
  });

  it('Color acepta letras con tildes y espacios, y rechaza números o símbolos', () => {
    expect(Color.of('  Azul  marino ').value).toBe('Azul marino');
    expect(Color.of('Café').value).toBe('Café');
    for (const raw of ['', '123', 'rojo!', 'x'.repeat(31)]) {
      expect(() => Color.of(raw)).toThrow(InvalidColorError);
    }
  });
});

describe('Identificadores', () => {
  it('generate crea un UUID válido y of lo normaliza a minúsculas', () => {
    const id = CategoryId.generate();
    expect(CategoryId.of(id.value.toUpperCase()).equals(id)).toBe(true);
  });

  it('cada tipo rechaza un texto que no es UUID', () => {
    expect(() => CategoryId.of('no-es-uuid')).toThrow(InvalidCatalogIdError);
    expect(() => ProductId.of('')).toThrow(InvalidCatalogIdError);
    expect(() => VariantId.of('123')).toThrow(InvalidCatalogIdError);
  });

  it('un ProductId y un VariantId con el mismo valor no son iguales', () => {
    const value = ProductId.generate().value;
    expect(ProductId.of(value).equals(VariantId.of(value) as unknown as ProductId)).toBe(false);
  });
});

describe('Slug: sufijo y respaldo', () => {
  it('withSuffix agrega -N', () => {
    expect(Slug.of('bota-andes').withSuffix(2).value).toBe('bota-andes-2');
  });

  it('withSuffix recorta la base ANTES del sufijo para no pasar de 80 caracteres', () => {
    const long = Slug.fromText('palabra '.repeat(30));

    const suffixed = long.withSuffix(12);

    expect(suffixed.value.length).toBeLessThanOrEqual(80);
    expect(suffixed.value.endsWith('-12')).toBe(true);
    expect(suffixed.value).not.toContain('--');
  });

  it('un texto sin letras ni dígitos da "producto" en vez de fallar', () => {
    expect(Slug.fromTextOrDefault('★★★').value).toBe('producto');
    expect(Slug.fromTextOrDefault('Bota Coñac').value).toBe('bota-conac');
  });
});
