import {
  DuplicateSkuError,
  DuplicateVariantError,
  InvalidDescriptionError,
  ProductWithoutVariantsError,
  VariantNotFoundError,
} from '../errors/catalog.errors.js';
import { CategoryId, ProductId, VariantId } from '../value-objects/ids.vo.js';
import { ProductName } from '../value-objects/names.vo.js';
import { Sku } from '../value-objects/variant-attributes.vo.js';
import { Variant, VariantChanges, variantProps, VariantProps } from './variant.entity.js';

const MAX_DESCRIPTION = 2000;

export interface ProductProps {
  id: ProductId;
  categoryId: CategoryId;
  name: ProductName;
  description: string | null;
  active: boolean;
  variants: Variant[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductDetails {
  categoryId?: CategoryId;
  name?: ProductName;
  description?: string | null;
}

// Solo las propiedades que el cambio indica; así un color explícitamente nulo sí se aplica.
const definedChanges = (changes: VariantChanges): Partial<VariantProps> => ({
  ...(changes.size && { size: changes.size }),
  ...(changes.color !== undefined && { color: changes.color }),
  ...(changes.price && { price: changes.price }),
});

const cleanDescription = (raw: string | null | undefined): string | null => {
  const value = raw?.trim() ?? '';
  if (value.length > MAX_DESCRIPTION) throw new InvalidDescriptionError();
  return value === '' ? null : value;
};

// Raíz del agregado: protege que haya al menos una variante y que ni el SKU ni la combinación
// talla/color se repitan dentro del producto. La unicidad global de SKU la garantiza la base.
export class Product {
  private constructor(private props: ProductProps) {}

  static register(
    input: { categoryId: CategoryId; name: ProductName; description?: string | null },
    variants: Variant[],
    now: Date = new Date()
  ): Product {
    const product = new Product({
      id: ProductId.generate(),
      categoryId: input.categoryId,
      name: input.name,
      description: cleanDescription(input.description),
      active: true,
      variants: [],
      createdAt: now,
      updatedAt: now,
    });
    if (variants.length === 0) throw new ProductWithoutVariantsError();
    variants.forEach((variant) => product.addVariant(variant, now));
    return product;
  }

  static restore(props: ProductProps): Product {
    return new Product({ ...props, variants: [...props.variants] });
  }

  addVariant(variant: Variant, now: Date = new Date()): void {
    this.assertNoClash(variant);
    this.props = { ...this.props, variants: [...this.props.variants, variant], updatedAt: now };
  }

  changeVariant(id: VariantId, changes: VariantChanges, now: Date = new Date()): void {
    const variant = this.variant(id);
    this.assertNoClash(Variant.restore({ ...variantProps(variant), ...definedChanges(changes) }));
    variant.change(changes);
    this.props = { ...this.props, updatedAt: now };
  }

  update(details: ProductDetails, now: Date = new Date()): void {
    this.props = {
      ...this.props,
      categoryId: details.categoryId ?? this.props.categoryId,
      name: details.name ?? this.props.name,
      description:
        details.description === undefined
          ? this.props.description
          : cleanDescription(details.description),
      updatedAt: now,
    };
  }

  setActive(active: boolean, now: Date = new Date()): void {
    this.props = { ...this.props, active, updatedAt: now };
  }

  variant(id: VariantId): Variant {
    const found = this.props.variants.find((candidate) => candidate.id.equals(id));
    if (!found) throw new VariantNotFoundError();
    return found;
  }

  // El SKU nuevo debe seguir siendo único dentro del producto (la unicidad global la da la base).
  changeVariantSku(id: VariantId, sku: Sku, now: Date = new Date()): void {
    const variant = this.variant(id);
    this.assertNoClash(Variant.restore({ ...variantProps(variant), sku }));
    variant.changeSku(sku);
    this.props = { ...this.props, updatedAt: now };
  }

  private assertNoClash(candidate: Variant): void {
    for (const other of this.props.variants) {
      if (other.id.equals(candidate.id)) continue;
      if (other.sku.equals(candidate.sku)) throw new DuplicateSkuError(candidate.sku.value);
      const sameColor = (other.color?.value ?? null) === (candidate.color?.value ?? null);
      if (sameColor && other.size.equals(candidate.size)) {
        throw new DuplicateVariantError(candidate.size.value, candidate.color?.value ?? null);
      }
    }
  }

  get id(): ProductId {
    return this.props.id;
  }

  get categoryId(): CategoryId {
    return this.props.categoryId;
  }

  get name(): ProductName {
    return this.props.name;
  }

  get description(): string | null {
    return this.props.description;
  }

  get active(): boolean {
    return this.props.active;
  }

  get variants(): readonly Variant[] {
    return this.props.variants;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
