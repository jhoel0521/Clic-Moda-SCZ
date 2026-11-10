import { describe, expect, it } from 'vitest';
import {
  createPayload,
  draftFrom,
  emptyDraft,
  newVariant,
  skuErrorFor,
  validate,
} from './product-form';

const valid = () => ({
  ...emptyDraft(),
  name: 'Bota Chelsea',
  categoryId: 'cat-1',
  variants: [{ ...newVariant(), size: '38', price: '349.90' }],
});

describe('validate', () => {
  it('acepta un borrador correcto', () => {
    expect(validate(valid())).toEqual({});
  });

  it('exige nombre, categoría y una variante', () => {
    const errors = validate({ ...emptyDraft(), variants: [] });

    expect(Object.keys(errors).sort()).toEqual(['categoryId', 'name', 'variants']);
  });

  it.each(['', '0', '0.00', '-5', '1.234', '100000.5', 'abc', '1,50'])(
    'rechaza el precio "%s" junto al campo de esa variante',
    (price) => {
      const draft = valid();
      draft.variants[0]!.price = price;

      expect(validate(draft)[`${draft.variants[0]!.key}.price`]).toBeDefined();
    }
  );
});

describe('validate: talla y SKU', () => {
  it('exige la talla y valida el SKU solo si se escribió', () => {
    const draft = valid();
    draft.variants[0]!.size = ' ';
    draft.variants[0]!.sku = 'a b';
    const errors = validate(draft);

    expect(errors[`${draft.variants[0]!.key}.size`]).toBeDefined();
    expect(errors[`${draft.variants[0]!.key}.sku`]).toBeDefined();
    draft.variants[0]!.sku = '';
    draft.variants[0]!.size = '38';
    expect(validate(draft)).toEqual({});
  });
});

describe('createPayload y draftFrom', () => {
  it('limpia espacios y envía null/undefined en lo opcional', () => {
    const draft = valid();
    draft.name = '  Bota Chelsea ';
    draft.variants[0]!.color = ' ';

    const payload = createPayload(draft);
    expect(payload.name).toBe('Bota Chelsea');
    expect(payload.description).toBeNull();
    expect(payload.variants[0]).toEqual({
      sku: undefined,
      size: '38',
      color: null,
      price: '349.90',
    });
  });
});

describe('draftFrom', () => {
  it('draftFrom convierte un producto del servidor en un borrador editable', () => {
    const draft = draftFrom({
      id: 'p1',
      categoryId: 'c1',
      name: 'Bota',
      description: null,
      active: true,
      variants: [
        { id: 'v1', sku: 'BOT-38', size: '38', color: null, price: '100.00', active: false },
      ],
    });

    expect(draft.description).toBe('');
    expect(draft.variants[0]).toMatchObject({ id: 'v1', color: '', active: false });
  });
});

describe('skuErrorFor', () => {
  it('asocia un SKU duplicado con la variante que lo escribió', () => {
    const draft = valid();
    draft.variants[0]!.sku = 'bot-38';

    expect(skuErrorFor('El SKU BOT-38 ya existe', draft)).toEqual({
      [`${draft.variants[0]!.key}.sku`]: 'El SKU BOT-38 ya existe',
    });
  });

  it('devuelve null para otros errores o si ninguna variante lo escribió', () => {
    expect(skuErrorFor('La categoría no existe', valid())).toBeNull();
    expect(skuErrorFor('El SKU X-1 ya existe', valid())).toBeNull();
  });
});
