import {
  DuplicateSkuError,
  DuplicateVariantError,
  InvalidDescriptionError,
  ProductWithoutVariantsError,
  VariantNotFoundError,
} from '../errors/catalog.errors.js';
import { CategoryId, VariantId } from '../value-objects/ids.vo.js';
import { Money } from '../value-objects/money.vo.js';
import { CategoryName, ProductName } from '../value-objects/names.vo.js';
import { Color, Size, Sku } from '../value-objects/variant-attributes.vo.js';
import { Category } from './category.entity.js';
import { Product } from './product.entity.js';
import { Variant } from './variant.entity.js';

const variant = (sku: string, size: string, color: string | null = null): Variant =>
  Variant.create({
    sku: Sku.of(sku),
    size: Size.of(size),
    color: color ? Color.of(color) : null,
    price: Money.ofDecimal('349.90'),
  });

const register = (variants: Variant[]): Product =>
  Product.register(
    { categoryId: CategoryId.generate(), name: ProductName.of('Zapatilla Runner') },
    variants
  );

describe('Category', () => {
  it('se crea activa con el slug derivado del nombre', () => {
    const category = Category.create(CategoryName.of('Zapatillas Urbanas'));
    expect(category.active).toBe(true);
    expect(category.slug.value).toBe('zapatillas-urbanas');
  });

  it('al renombrarla, el slug sigue al nombre y se actualiza la fecha', () => {
    const category = Category.create(CategoryName.of('Botas'), new Date('2026-01-01'));
    category.rename(CategoryName.of('Botines Ñandú'), new Date('2026-02-01'));
    expect(category.slug.value).toBe('botines-nandu');
    expect(category.updatedAt).toEqual(new Date('2026-02-01'));
    expect(category.createdAt).toEqual(new Date('2026-01-01'));
  });
});

describe('Product.register', () => {
  it('guarda el producto activo con sus variantes', () => {
    const product = register([variant('ZAP-38', '38', 'Negro'), variant('ZAP-39', '39', 'Negro')]);
    expect(product.active).toBe(true);
    expect(product.variants).toHaveLength(2);
  });

  it('exige al menos una variante', () => {
    expect(() => register([])).toThrow(ProductWithoutVariantsError);
  });

  it('rechaza un SKU repetido dentro del producto', () => {
    expect(() => register([variant('ZAP-38', '38'), variant('zap-38', '39')])).toThrow(
      DuplicateSkuError
    );
  });
});

describe('Product.register: variantes y datos', () => {
  it('rechaza la misma talla y color dos veces, pero permite la misma talla en otro color', () => {
    expect(() => register([variant('A-1', '38', 'Negro'), variant('A-2', '38', 'Negro')])).toThrow(
      DuplicateVariantError
    );
    expect(
      register([variant('A-1', '38', 'Negro'), variant('A-2', '38', 'Rojo')]).variants
    ).toHaveLength(2);
  });

  it('rechaza una descripción de más de 2000 caracteres y normaliza la vacía a nulo', () => {
    const base = { categoryId: CategoryId.generate(), name: ProductName.of('Bota') };
    expect(() =>
      Product.register({ ...base, description: 'x'.repeat(2001) }, [variant('B-1', '40')])
    ).toThrow(InvalidDescriptionError);
    expect(
      Product.register({ ...base, description: '  ' }, [variant('B-1', '40')]).description
    ).toBeNull();
  });
});

describe('Product: variantes', () => {
  it('agrega una variante nueva y respeta las reglas de unicidad', () => {
    const product = register([variant('ZAP-38', '38')]);
    product.addVariant(variant('ZAP-39', '39'));
    expect(product.variants).toHaveLength(2);
    expect(() => product.addVariant(variant('ZAP-40', '38'))).toThrow(DuplicateVariantError);
    expect(() => product.addVariant(variant('ZAP-38', '41'))).toThrow(DuplicateSkuError);
  });

  it('cambia precio, talla y color; un color nulo explícito sí se aplica', () => {
    const product = register([variant('ZAP-38', '38', 'Negro')]);
    const id = product.variants[0]!.id;
    product.changeVariant(id, { price: Money.ofDecimal('400'), color: null, size: Size.of('39') });
    const changed = product.variant(id);
    expect(changed.price.cents).toBe(40000);
    expect(changed.color).toBeNull();
    expect(changed.size.value).toBe('39');
  });
});

describe('Product: cambios en variantes', () => {
  it('no deja que un cambio choque con otra variante, y no modifica nada si falla', () => {
    const product = register([variant('A-1', '38'), variant('A-2', '39')]);
    const second = product.variants[1]!;
    expect(() => product.changeVariant(second.id, { size: Size.of('38') })).toThrow(
      DuplicateVariantError
    );
    expect(second.size.value).toBe('39');
  });

  it('cambia el SKU de una variante y rechaza uno ya usado en el producto', () => {
    const product = register([variant('A-1', '38'), variant('A-2', '39')]);
    const [first, second] = product.variants as [Variant, Variant];
    product.changeVariantSku(first.id, Sku.of('NUEVO-1'));
    expect(first.sku.value).toBe('NUEVO-1');
    expect(() => product.changeVariantSku(second.id, Sku.of('nuevo-1'))).toThrow(DuplicateSkuError);
  });

  it('activa y desactiva una variante y falla si no existe', () => {
    const product = register([variant('A-1', '38')]);
    product.variants[0]!.setActive(false);
    expect(product.variants[0]!.active).toBe(false);
    expect(() => product.variant(VariantId.generate())).toThrow(VariantNotFoundError);
  });
});

describe('Product: datos', () => {
  it('se desactiva y reactiva conservando sus variantes', () => {
    const product = register([variant('A-1', '38')]);
    product.setActive(false);
    expect(product.active).toBe(false);
    expect(product.variants).toHaveLength(1);
  });

  it('actualiza nombre, categoría y descripción por separado', () => {
    const product = register([variant('A-1', '38')]);
    const category = CategoryId.generate();
    product.update({ name: ProductName.of('Otro nombre'), categoryId: category });
    product.update({ description: 'Suela de goma' });
    expect(product.name.value).toBe('Otro nombre');
    expect(product.categoryId.equals(category)).toBe(true);
    expect(product.description).toBe('Suela de goma');
    product.update({ description: null });
    expect(product.description).toBeNull();
  });
});
