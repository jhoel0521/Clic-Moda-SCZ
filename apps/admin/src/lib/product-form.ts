import { api } from './client-api';
import type { Product } from './types';

// Estado editable de una variante en el formulario (todo texto, como lo escribe la persona).
export interface VariantDraft {
  key: string; // identificador local de la fila
  id?: string; // id real si la variante ya existe
  sku: string;
  size: string;
  color: string;
  price: string;
  active: boolean;
}

export interface ProductDraft {
  name: string;
  description: string;
  categoryId: string;
  variants: VariantDraft[];
}

export type Errors = Record<string, string>;

let counter = 0;
export const newVariant = (): VariantDraft => ({
  key: `v${(counter += 1)}`,
  sku: '',
  size: '',
  color: '',
  price: '',
  active: true,
});

export const emptyDraft = (): ProductDraft => ({
  name: '',
  description: '',
  categoryId: '',
  variants: [newVariant()],
});

export const draftFrom = (product: Product): ProductDraft => ({
  name: product.name,
  description: product.description ?? '',
  categoryId: product.categoryId,
  variants: product.variants.map((variant) => ({
    key: variant.id,
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color ?? '',
    price: variant.price,
    active: variant.active,
  })),
});

const PRICE = /^\d{1,6}(\.\d{1,2})?$/;
const SKU = /^[A-Za-z0-9.-]{3,40}$/;

function variantErrors(variant: VariantDraft, errors: Errors): void {
  const at = (field: string) => `${variant.key}.${field}`;
  if (!variant.size.trim()) errors[at('size')] = 'Indica la talla';
  if (
    !PRICE.test(variant.price.trim()) ||
    Number(variant.price) <= 0 ||
    Number(variant.price) > 100000
  ) {
    errors[at('price')] = 'Precio entre 0.01 y 100000, con hasta 2 decimales';
  }
  if (variant.sku.trim() && !SKU.test(variant.sku.trim())) {
    errors[at('sku')] = 'De 3 a 40 letras, números, guiones o puntos';
  }
}

// Valida antes de enviar; el servidor vuelve a validar todo (esto solo evita viajes inútiles).
export function validate(draft: ProductDraft): Errors {
  const errors: Errors = {};
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 120)
    errors.name = 'El nombre debe tener de 2 a 120 caracteres';
  if (!draft.categoryId) errors.categoryId = 'Elige una categoría';
  if (draft.variants.length === 0) errors.variants = 'Agrega al menos una variante';
  draft.variants.forEach((variant) => variantErrors(variant, errors));
  return errors;
}

const variantBody = (variant: VariantDraft) => ({
  sku: variant.sku.trim() || undefined,
  size: variant.size.trim(),
  color: variant.color.trim() || null,
  price: variant.price.trim(),
});

export const createPayload = (draft: ProductDraft) => ({
  categoryId: draft.categoryId,
  name: draft.name.trim(),
  description: draft.description.trim() || null,
  variants: draft.variants.map(variantBody),
});

// Guarda un producto nuevo (una sola llamada, atómica en el servidor).
export const createProduct = (draft: ProductDraft): Promise<Product> =>
  api<Product>('POST', 'catalog/products', createPayload(draft));

async function saveVariant(productId: string, current: VariantDraft, original?: VariantDraft) {
  if (!original) {
    const added = await api<Product>(
      'POST',
      `catalog/products/${productId}/variants`,
      variantBody(current)
    );
    return added;
  }
  const body = { ...variantBody(current), sku: current.sku.trim() || original.sku };
  await api('PATCH', `catalog/variants/${original.id}`, body);
  if (current.active !== original.active) {
    await api('PATCH', `catalog/variants/${original.id}/active`, { active: current.active });
  }
  return null;
}

// Guarda los cambios de un producto existente: datos del producto y luego variante por variante.
export async function updateProduct(
  productId: string,
  draft: ProductDraft,
  saved: Product
): Promise<void> {
  await api('PATCH', `catalog/products/${productId}`, {
    name: draft.name.trim(),
    description: draft.description.trim() || null,
    categoryId: draft.categoryId,
  });
  const originals = draftFrom(saved).variants;
  for (const variant of draft.variants) {
    await saveVariant(
      productId,
      variant,
      originals.find((o) => o.id === variant.id)
    );
  }
}

// Si el servidor rechaza un SKU repetido, el error se muestra junto al campo SKU de esa variante.
export function skuErrorFor(message: string, draft: ProductDraft): Errors | null {
  const match = /^El SKU (\S+) ya existe/.exec(message);
  const clash = match && draft.variants.find((v) => v.sku.trim().toUpperCase() === match[1]);
  return clash ? { [`${clash.key}.sku`]: message } : null;
}
