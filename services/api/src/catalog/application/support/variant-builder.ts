import { Variant } from '../../domain/entities/variant.entity.js';
import type { ProductsRepository } from '../../domain/products.repository.port.js';
import { SkuGenerator } from '../../domain/sku-generator.js';
import { Money } from '../../domain/value-objects/money.vo.js';
import type { ProductName } from '../../domain/value-objects/names.vo.js';
import { Color, Size, Sku } from '../../domain/value-objects/variant-attributes.vo.js';
import type { VariantInput } from '../dtos/product.dtos.js';

const MAX_ATTEMPTS = 50;

// Busca un SKU generado que no exista en la base ni entre los ya reservados en esta misma solicitud.
async function freeSku(
  products: ProductsRepository,
  name: ProductName,
  size: Size,
  color: Color | null,
  reserved: Set<string>
): Promise<Sku> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = SkuGenerator.generate(name, size, color, attempt);
    if (!reserved.has(candidate.value) && !(await products.skuExists(candidate))) return candidate;
  }
  throw new Error('No se pudo generar un SKU libre');
}

// Convierte las entradas de la API en variantes: valida cada valor y genera el SKU si falta.
export async function buildVariants(
  products: ProductsRepository,
  name: ProductName,
  inputs: readonly VariantInput[],
  alreadyTaken: Iterable<string> = []
): Promise<Variant[]> {
  const reserved = new Set(alreadyTaken);
  const variants: Variant[] = [];
  for (const input of inputs) {
    const size = Size.of(input.size);
    const color = input.color ? Color.of(input.color) : null;
    const sku = input.sku
      ? Sku.of(input.sku)
      : await freeSku(products, name, size, color, reserved);
    reserved.add(sku.value);
    variants.push(Variant.create({ sku, size, color, price: Money.ofDecimal(input.price) }));
  }
  return variants;
}
